import hashlib
import hmac
import json
import os
import time
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import School, SchoolSubscription, SubscriptionPlan
from datetime import timedelta

class StripeWebhookView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    @transaction.atomic
    def post(self, request):
        secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
        signature = request.headers.get("Stripe-Signature", "")
        if not secret:
            return Response({"detail": "Billing webhook is not configured."}, status=503)
        parts = dict(item.split("=", 1) for item in signature.split(",") if "=" in item)
        try:
            timestamp = int(parts["t"])
            expected = hmac.new(secret.encode(), str(timestamp).encode() + b"." + request.body, hashlib.sha256).hexdigest()
            valid_time = abs(time.time() - timestamp) <= 300
            signatures = [part[3:] for part in signature.split(",") if part.startswith("v1=")]
            valid_signature = any(hmac.compare_digest(expected, value) for value in signatures)
            if not valid_time or not valid_signature:
                raise ValueError
            event = json.loads(request.body)
        except (KeyError, ValueError, json.JSONDecodeError):
            return Response({"detail": "Invalid webhook signature or payload."}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get("type", "")
        obj = event.get("data", {}).get("object", {})
        stripe_id = obj.get("id") or obj.get("subscription")
        subscription = SchoolSubscription.objects.filter(stripe_subscription_id=stripe_id).select_related("school", "plan").first()
        metadata = obj.get("metadata") or {}
        if not subscription and metadata.get("school_id"):
            school = School.objects.filter(pk=metadata["school_id"]).first()
            if school:
                plan = SubscriptionPlan.objects.filter(pk=metadata.get("plan_id"), is_active=True).first() or SubscriptionPlan.objects.filter(is_active=True).order_by("price_monthly").first()
                if plan:
                    subscription = SchoolSubscription.objects.filter(school=school, status="active").first()
                    if subscription:
                        subscription.plan = plan
                        subscription.stripe_subscription_id = stripe_id or ""
                    else:
                        subscription = SchoolSubscription(school=school, plan=plan, status="active", start_date=school.created_at.date(), stripe_subscription_id=stripe_id or "")
        if subscription:
            if event_type.endswith(".deleted") or event_type == "customer.subscription.deleted":
                subscription.status = "canceled"
            elif event_type == "invoice.payment_failed":
                subscription.status = "past_due"
                subscription.end_date = timezone.localdate() + timedelta(days=7)
            elif event_type in ("invoice.paid", "customer.subscription.created", "customer.subscription.updated"):
                subscription.status = "active"
            period_end = obj.get("current_period_end")
            if period_end:
                from datetime import date, datetime, timezone as dt_timezone
                subscription.end_date = datetime.fromtimestamp(period_end, dt_timezone.utc).date()
            subscription.save(update_fields=("status", "end_date", "updated_at"))
        return Response({"received": True})

class CreateCheckoutSessionView(APIView):
    def post(self, request):
        if request.user.role != "school_admin" or not request.user.school_id:
            return Response({"detail": "Only a school administrator can change the school's plan."}, status=403)
        plan = SubscriptionPlan.objects.filter(pk=request.data.get("plan"), is_active=True).first()
        if not plan or not plan.stripe_price_id:
            return Response({"detail": "This plan is not configured for online checkout."}, status=400)
        try:
            import stripe
            stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
            session = stripe.checkout.Session.create(mode="subscription", line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
                success_url=os.getenv("STRIPE_SUCCESS_URL", "http://localhost:3001/settings?billing=success"),
                cancel_url=os.getenv("STRIPE_CANCEL_URL", "http://localhost:3001/settings?billing=cancel"),
                client_reference_id=str(request.user.school_id), subscription_data={"metadata": {"school_id": str(request.user.school_id), "plan_id": str(plan.pk)}})
            return Response({"checkout_url": session.url})
        except (ImportError, KeyError):
            return Response({"detail": "Stripe checkout is not configured."}, status=503)
