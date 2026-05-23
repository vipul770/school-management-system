import os
from pathlib import Path
import logging
from contextlib import contextmanager
from typing import Generator
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import event, inspect, text
from sqlalchemy.pool import QueuePool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load backend .env before reading database settings so direct imports behave correctly.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Read database connection info from environment
RAW_DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
DB_HOST = os.getenv("DB_HOST", "").strip()
DB_NAME = os.getenv("DB_NAME", "").strip()
DB_USER = os.getenv("DB_USER", "").strip()
DB_PASS = os.getenv("DB_PASS", "").strip()
DB_PORT = os.getenv("DB_PORT", "5432").strip()
DB_SSL_MODE = os.getenv("DB_SSL_MODE", "prefer").strip()
DB_POOL_SIZE = os.getenv("DB_POOL_SIZE", "20").strip()
DB_MAX_OVERFLOW = os.getenv("DB_MAX_OVERFLOW", "30").strip()
DB_POOL_TIMEOUT = os.getenv("DB_POOL_TIMEOUT", "30").strip()
DB_POOL_RECYCLE = os.getenv("DB_POOL_RECYCLE", "3600").strip()
sqlite_path = (BASE_DIR / "data_new.db").resolve()

# Database configuration
if RAW_DATABASE_URL:
    DATABASE_URL = RAW_DATABASE_URL
    logger.info("Using database from DATABASE_URL")
elif DB_HOST and DB_NAME and DB_USER:
    encoded_password = quote_plus(DB_PASS)
    DATABASE_URL = (
        f"postgresql+psycopg2://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        f"?sslmode={DB_SSL_MODE}"
    )
    logger.info(f"Using PostgreSQL database: {DB_HOST}:{DB_PORT}/{DB_NAME}")
else:
    # Default to SQLite for local development when explicit database settings are absent.
    DATABASE_URL = f"sqlite:///{sqlite_path.as_posix()}"
    logger.warning(f"Using SQLite database: {sqlite_path}")

# Engine configuration with enhanced settings for PostgreSQL
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Set to True for SQL logging in development
        poolclass=QueuePool,
        pool_size=int(DB_POOL_SIZE),
        max_overflow=int(DB_MAX_OVERFLOW),
        pool_timeout=int(DB_POOL_TIMEOUT),
        pool_recycle=int(DB_POOL_RECYCLE),
        pool_pre_ping=True,  # Check connections before use
        connect_args={
            "application_name": "school_management_api",
            "options": "-c timezone=UTC",
            "sslmode": DB_SSL_MODE,
        }
    )
else:
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={
            "check_same_thread": False,
            "timeout": 20,
        }
    )

# Add connection event listeners for PostgreSQL
if DATABASE_URL.startswith("postgresql"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Set PostgreSQL connection parameters"""
        with dbapi_connection.cursor() as cursor:
            # Set timezone to UTC
            cursor.execute("SET timezone = 'UTC'")
            # Set application name
            cursor.execute("SET application_name = 'school_management_api'")
            # Set statement timeout (in milliseconds)
            cursor.execute("SET statement_timeout = '30000'")
            # Enable query logging if needed
            cursor.execute("SET log_statement = 'none'")

    @event.listens_for(engine, "checkout")
    def receive_checkout(dbapi_connection, connection_record, connection_proxy):
        """Log connection checkout"""
        logger.debug("Connection checked out from pool")

    @event.listens_for(engine, "checkin")
    def receive_checkin(dbapi_connection, connection_record):
        """Log connection checkin"""
        logger.debug("Connection checked in to pool")


def create_db_and_tables():
    """Create database and all tables"""
    try:
        logger.info("Creating database tables...")
        SQLModel.metadata.create_all(engine)
        ensure_schema_updates()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


def ensure_schema_updates():
    """Apply lightweight schema updates for existing databases."""
    try:
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        column_updates = [
            (
                "user",
                "\"user\"" if DATABASE_URL.startswith("postgresql") else "user",
                "must_change_password",
                "BOOLEAN DEFAULT FALSE" if DATABASE_URL.startswith("postgresql") else "BOOLEAN DEFAULT 0",
            ),
            (
                "userrequest",
                "userrequest",
                "must_change_password",
                "BOOLEAN DEFAULT FALSE" if DATABASE_URL.startswith("postgresql") else "BOOLEAN DEFAULT 0",
            ),
            (
                "classroom",
                "classroom",
                "class_teacher_user_id",
                "INTEGER",
            ),
            (
                "user_students",
                "user_students",
                "classroom_id",
                "INTEGER",
            ),
        ]

        for inspector_name, alter_name, column_name, column_sql in column_updates:
            if inspector_name not in table_names:
                continue
            columns = {column["name"] for column in inspector.get_columns(inspector_name)}
            if column_name in columns:
                continue

            logger.info("Adding %s column to %s table", column_name, inspector_name)
            with engine.begin() as connection:
                connection.execute(text(f"ALTER TABLE {alter_name} ADD COLUMN {column_name} {column_sql}"))
            logger.info("Added %s column to %s successfully", column_name, inspector_name)
    except Exception as e:
        logger.error(f"Error applying schema updates: {e}")
        raise


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """Get database session with proper error handling"""
    session = Session(engine)
    try:
        yield session
    except Exception as e:
        logger.error(f"Database session error: {e}")
        session.rollback()
        raise
    finally:
        session.close()


def get_session() -> Generator[Session, None, None]:
    """Get database session (legacy compatibility)"""
    with Session(engine) as session:
        yield session


def save(instance):
    """Persist a SQLModel instance and return the refreshed object."""
    try:
        with Session(engine) as session:
            session.add(instance)
            session.commit()
            session.refresh(instance)
            logger.debug(f"Saved instance: {instance.__class__.__name__}")
            return instance
    except Exception as e:
        logger.error(f"Error saving instance: {e}")
        raise


def save_all(instances):
    """Persist multiple SQLModel instances."""
    try:
        with Session(engine) as session:
            session.add_all(instances)
            session.commit()
            for instance in instances:
                session.refresh(instance)
            logger.debug(f"Saved {len(instances)} instances")
            return instances
    except Exception as e:
        logger.error(f"Error saving instances: {e}")
        raise


def delete(instance):
    """Delete a SQLModel instance."""
    try:
        with Session(engine) as session:
            session.delete(instance)
            session.commit()
            logger.debug(f"Deleted instance: {instance.__class__.__name__}")
    except Exception as e:
        logger.error(f"Error deleting instance: {e}")
        raise


def execute_raw_sql(query: str, params: dict = None):
    """Execute raw SQL query with parameters."""
    try:
        with Session(engine) as session:
            result = session.execute(query, params or {})
            session.commit()
            return result
    except Exception as e:
        logger.error(f"Error executing raw SQL: {e}")
        raise


def execute_stored_procedure(procedure_name: str, params: dict = None):
    """Execute stored procedure."""
    try:
        with Session(engine) as session:
            if DATABASE_URL.startswith("postgresql"):
                # PostgreSQL stored procedure
                call_string = f"CALL {procedure_name}("
                if params:
                    param_keys = list(params.keys())
                    placeholders = ", ".join([f":{key}" for key in param_keys])
                    call_string += placeholders
                call_string += ")"
                
                result = session.execute(call_string, params or {})
                session.commit()
                return result
            else:
                # SQLite doesn't support stored procedures
                raise NotImplementedError("Stored procedures not supported with SQLite")
    except Exception as e:
        logger.error(f"Error executing stored procedure: {e}")
        raise


def check_database_connection() -> bool:
    """Check if database connection is working."""
    try:
        with Session(engine) as session:
            session.execute("SELECT 1")
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def get_database_info() -> dict:
    """Get database information."""
    try:
        with Session(engine) as session:
            if DATABASE_URL.startswith("postgresql"):
                # PostgreSQL version and info
                version_result = session.execute("SELECT version()")
                version = version_result.scalar()
                
                # Connection info
                connection_info = {
                    "type": "PostgreSQL",
                    "version": version,
                    "host": DB_HOST,
                    "port": DB_PORT,
                    "database": DB_NAME,
                    "user": DB_USER,
                    "pool_size": DB_POOL_SIZE,
                    "max_overflow": DB_MAX_OVERFLOW,
                }
            else:
                # SQLite info
                connection_info = {
                    "type": "SQLite",
                    "database": str(sqlite_path),
                }
            
            return connection_info
    except Exception as e:
        logger.error(f"Error getting database info: {e}")
        return {"error": str(e)}


def health_check() -> dict:
    """Perform comprehensive database health check."""
    health_status = {
        "database_connected": False,
        "connection_info": {},
        "tables_created": False,
        "error": None
    }
    
    try:
        # Check connection
        health_status["database_connected"] = check_database_connection()
        
        if health_status["database_connected"]:
            # Get connection info
            health_status["connection_info"] = get_database_info()
            
            # Check if tables exist
            with Session(engine) as session:
                if DATABASE_URL.startswith("postgresql"):
                    table_count = session.execute(
                        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
                    ).scalar()
                else:
                    table_count = session.execute(
                        "SELECT COUNT(*) FROM sqlite_master WHERE type='table'"
                    ).scalar()
                
                health_status["tables_created"] = table_count > 0
                health_status["table_count"] = table_count
        
    except Exception as e:
        health_status["error"] = str(e)
        logger.error(f"Database health check failed: {e}")
    
    return health_status


# Initialize database on import
if __name__ == "__main__":
    # Test database connection
    if check_database_connection():
        print("Database connection successful!")
        print(f"Database info: {get_database_info()}")
    else:
        print("Database connection failed!")
    
    # Create tables
    create_db_and_tables()
