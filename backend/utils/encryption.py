"""Authenticated field-value encryption; deployments must supply a persistent Fernet key."""
import os
from cryptography.fernet import Fernet

def _fernet():
    key = os.getenv("FIELD_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("FIELD_ENCRYPTION_KEY must be configured to encrypt sensitive data.")
    return Fernet(key.encode())

def encrypt_value(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()

def decrypt_value(value: str) -> str:
    return _fernet().decrypt(value.encode()).decode()
