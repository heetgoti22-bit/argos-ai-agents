"""AES-256-Fernet credential vault."""

from cryptography.fernet import Fernet
import json
import time
from app.config import settings


class CredentialVault:
    def __init__(self):
        if settings.vault_master_key:
            self.cipher = Fernet(settings.vault_master_key.encode())
        else:
            # Generate ephemeral key for dev
            self._key = Fernet.generate_key()
            self.cipher = Fernet(self._key)
        self.audit_log: list[dict] = []

    def encrypt(self, key: str, value: str) -> bytes:
        data = json.dumps({"key": key, "value": value, "ts": time.time()})
        self.audit_log.append({"action": "encrypt", "key": key, "ts": time.time()})
        return self.cipher.encrypt(data.encode())

    def decrypt(self, encrypted: bytes) -> str:
        result = json.loads(self.cipher.decrypt(encrypted).decode())
        self.audit_log.append({"action": "decrypt", "key": result["key"], "ts": time.time()})
        return result["value"]

    def rotate(self) -> bytes:
        new_key = Fernet.generate_key()
        self.audit_log.append({"action": "rotate", "ts": time.time()})
        return new_key

    def get_audit_log(self) -> list[dict]:
        return self.audit_log


# Singleton
vault = CredentialVault()
