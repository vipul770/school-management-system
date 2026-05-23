from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from datetime import datetime, timedelta
# from typing import Dict, Optional
from typing import Dict, Optional, List
import time
import json
from collections import defaultdict, deque
from .db import get_db_session
from .models import User
from .saas_models import UsageMetric, Subscription, SubscriptionStatus
from .auth import get_current_user
import redis
import os

# Redis client for rate limiting (fallback to in-memory if Redis not available)
try:
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    redis_client.ping()  # Test connection
    USE_REDIS = True
except:
    USE_REDIS = False
    redis_client = None

# In-memory fallback storage
memory_storage: Dict[str, Dict] = defaultdict(dict)

class RateLimiter:
    """Rate limiter for API endpoints per tenant"""
    
    def __init__(self):
        self.default_limits = {
            "free": {
                "requests_per_minute": 60,
                "requests_per_hour": 1000,
                "requests_per_day": 5000
            },
            "basic": {
                "requests_per_minute": 120,
                "requests_per_hour": 2500,
                "requests_per_day": 10000
            },
            "professional": {
                "requests_per_minute": 300,
                "requests_per_hour": 6000,
                "requests_per_day": 25000
            },
            "enterprise": {
                "requests_per_minute": 1000,
                "requests_per_hour": 20000,
                "requests_per_day": 100000
            }
        }
    
    def get_tenant_plan_limits(self, tenant_id: int, db: Session) -> Dict[str, int]:
        """Get rate limits based on tenant's subscription plan"""
        # Get subscription info
        subscription = db.exec(
            select(Subscription).where(Subscription.tenant_id == tenant_id)
        ).first()
        
        if not subscription or subscription.status != SubscriptionStatus.active:
            plan_type = "free"
        else:
            # Get plan type from subscription (would need to join with Plan table)
            plan_type = "professional"  # Default for active subscriptions
        
        return self.default_limits.get(plan_type, self.default_limits["free"])
    
    def is_rate_limited(
        self,
        tenant_id: int,
        endpoint: str,
        db: Session,
        window: str = "minute"
    ) -> tuple[bool, Dict[str, int]]:
        """Check if tenant is rate limited"""
        limits = self.get_tenant_plan_limits(tenant_id, db)
        
        # Get current window limits
        if window == "minute":
            max_requests = limits["requests_per_minute"]
            window_seconds = 60
        elif window == "hour":
            max_requests = limits["requests_per_hour"]
            window_seconds = 3600
        else:  # day
            max_requests = limits["requests_per_day"]
            window_seconds = 86400
        
        current_time = int(time.time())
        window_start = current_time - (current_time % window_seconds)
        key = f"rate_limit:{tenant_id}:{endpoint}:{window}"
        
        if USE_REDIS:
            return self._check_redis_rate_limit(key, max_requests, window_seconds)
        else:
            return self._check_memory_rate_limit(key, max_requests, window_seconds)
    
    def _check_redis_rate_limit(self, key: str, max_requests: int, window_seconds: int) -> tuple[bool, Dict[str, int]]:
        """Check rate limit using Redis"""
        try:
            # Get current count
            current_count = redis_client.get(key) or 0
            
            # Check if limit exceeded
            if int(current_count) >= max_requests:
                ttl = redis_client.ttl(key)
                return True, {
                    "current": int(current_count),
                    "limit": max_requests,
                    "reset_time": int(time.time()) + ttl
                }
            
            # Increment counter
            pipe = redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, window_seconds)
            pipe.execute()
            
            return False, {
                "current": int(current_count) + 1,
                "limit": max_requests,
                "reset_time": int(time.time()) + window_seconds
            }
            
        except Exception as e:
            # Fallback to memory if Redis fails
            return self._check_memory_rate_limit(key, max_requests, window_seconds)
    
    def _check_memory_rate_limit(self, key: str, max_requests: int, window_seconds: int) -> tuple[bool, Dict[str, int]]:
        """Check rate limit using in-memory storage"""
        current_time = int(time.time())
        
        if key not in memory_storage:
            memory_storage[key] = {
                "requests": deque(),
                "count": 0
            }
        
        storage = memory_storage[key]
        requests = storage["requests"]
        
        # Remove old requests outside the window
        window_start = current_time - window_seconds
        while requests and requests[0] < window_start:
            requests.popleft()
            storage["count"] -= 1
        
        # Check if limit exceeded
        if storage["count"] >= max_requests:
            oldest_request = requests[0] if requests else current_time
            reset_time = oldest_request + window_seconds
            return True, {
                "current": storage["count"],
                "limit": max_requests,
                "reset_time": reset_time
            }
        
        # Add current request
        requests.append(current_time)
        storage["count"] += 1
        
        return False, {
            "current": storage["count"],
            "limit": max_requests,
            "reset_time": current_time + window_seconds
        }
    
    def track_api_usage(self, tenant_id: int, endpoint: str, db: Session):
        """Track API usage for analytics"""
        # Track usage metrics
        current_month = datetime.utcnow().replace(day=1).isoformat()
        
        # This would be called after successful request
        # For now, we'll just note that this should be implemented
        pass


# Global rate limiter instance
rate_limiter = RateLimiter()

async def rate_limit_middleware(
    request: Request,
    call_next,
    db: Session = Depends(get_db_session)
):
    """Rate limiting middleware"""
    # Skip rate limiting for health checks and static files
    if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
        response = await call_next(request)
        return response
    
    # Extract tenant from JWT token
    try:
        # Get authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            response = await call_next(request)
            return response
        
        token = auth_header.split(" ")[1]
        
        # Decode token and get user (simplified - use actual JWT decoding)
        # For now, we'll skip rate limiting if we can't get tenant
        response = await call_next(request)
        return response
        
    except Exception:
        # If rate limiting fails, allow request
        response = await call_next(request)
        return response


def check_rate_limit(
    endpoint: str = "api",
    window: str = "minute"
):
    """Dependency to check rate limit for tenant"""
    def rate_limit_dependency(
        request: Request,
        db: Session = Depends(get_db_session),
        current_user: User = Depends(get_current_user)
    ):
        if not current_user.tenant_id:
            raise HTTPException(
                status_code=403,
                detail="No tenant associated"
            )
        
        # Check rate limit
        is_limited, limit_info = rate_limiter.is_rate_limited(
            current_user.tenant_id,
            endpoint,
            db,
            window
        )
        
        if is_limited:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded",
                headers={
                    "X-RateLimit-Limit": str(limit_info["limit"]),
                    "X-RateLimit-Remaining": str(max(0, limit_info["limit"] - limit_info["current"])),
                    "X-RateLimit-Reset": str(limit_info["reset_time"]),
                    "Retry-After": str(limit_info["reset_time"] - int(time.time()))
                }
            )
        
        # Add rate limit headers
        request.state.rate_limit_info = limit_info
        
        # Track usage
        rate_limiter.track_api_usage(current_user.tenant_id, endpoint, db)
        
        return limit_info
    
    return rate_limit_dependency


# Rate limit endpoints for monitoring
from fastapi import APIRouter

router = APIRouter()

@router.get("/rate-limit/status")
def get_rate_limit_status(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get current rate limit status for tenant"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="No tenant associated")
    
    limits = rate_limiter.get_tenant_plan_limits(current_user.tenant_id, db)
    
    # Get current usage for different windows
    status = {}
    for window in ["minute", "hour", "day"]:
        is_limited, limit_info = rate_limiter.is_rate_limited(
            current_user.tenant_id,
            "api",
            db,
            window
        )
        
        status[window] = {
            "current": limit_info["current"],
            "limit": limit_info["limit"],
            "remaining": max(0, limit_info["limit"] - limit_info["current"]),
            "reset_time": limit_info["reset_time"],
            "is_limited": is_limited
        }
    
    return {
        "tenant_id": current_user.tenant_id,
        "limits": limits,
        "current_usage": status
    }


@router.get("/admin/rate-limits")
def get_all_tenant_rate_limits(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user)
):
    """Get rate limit status for all tenants (admin only)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # This would require getting all tenants and their limits
    # For now, return summary
    return {
        "message": "Rate limiting is active",
        "redis_enabled": USE_REDIS,
        "default_limits": rate_limiter.default_limits,
        "active_tenants": len(memory_storage) if not USE_REDIS else "Redis storage"
    }


@router.post("/admin/rate-limit/reset")
def reset_tenant_rate_limit(
    tenant_id: int,
    endpoint: str = "api",
    window: str = "minute",
    current_user: User = Depends(get_current_user)
):
    """Reset rate limit for specific tenant (admin only)"""
    if current_user.role != 'superadmin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    key = f"rate_limit:{tenant_id}:{endpoint}:{window}"
    
    if USE_REDIS:
        try:
            redis_client.delete(key)
        except Exception:
            pass
    
    # Clear memory storage
    if key in memory_storage:
        del memory_storage[key]
    
    return {"message": f"Rate limit reset for tenant {tenant_id}"}


# Rate limit configuration
class RateLimitConfig:
    """Configuration for rate limiting"""
    
    @staticmethod
    def get_endpoint_limits() -> Dict[str, Dict[str, int]]:
        """Get specific limits for different endpoints"""
        return {
            "auth": {
                "requests_per_minute": 10,  # Login attempts
                "requests_per_hour": 100
            },
            "upload": {
                "requests_per_minute": 5,   # File uploads
                "requests_per_hour": 50
            },
            "export": {
                "requests_per_hour": 10,    # Data exports
                "requests_per_day": 50
            },
            "api": {
                "requests_per_minute": "default",
                "requests_per_hour": "default",
                "requests_per_day": "default"
            }
        }
    
    @staticmethod
    def get_exempt_endpoints() -> List[str]:
        """Endpoints exempt from rate limiting"""
        return [
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/static",
            "/favicon.ico"
        ]
