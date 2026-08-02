from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from app.core.config import settings

API_KEY_HEADER_NAME = "X-AME-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_HEADER_NAME, auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    """Verifies that the client requests are authenticated using the secret API Key."""
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Missing API Key header: {API_KEY_HEADER_NAME}"
        )
    if api_key != settings.AME_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key authentication credential."
        )
    return api_key
