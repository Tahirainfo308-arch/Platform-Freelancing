import hmac
import hashlib
import json
import logging
import httpx
import asyncio
from app.core.config import settings

logger = logging.getLogger("ame.webhooks")

class WebhookDispatcher:
    @staticmethod
    def _generate_signature(payload_bytes: bytes, secret: str) -> str:
        """Generates HMAC-SHA256 signature for payload verification."""
        return hmac.new(
            secret.encode("utf-8"),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    async def send_webhook(payload: dict, max_retries: int = 3) -> bool:
        """Dispatches a signed webhook payload to the marketplace base URL with exponential backoff."""
        url = f"{settings.MARKETPLACE_BASE_URL.rstrip('/')}{settings.MARKETPLACE_WEBHOOK_PATH}"
        payload_json = json.dumps(payload)
        payload_bytes = payload_json.encode("utf-8")
        
        # Calculate HMAC signature
        signature = WebhookDispatcher._generate_signature(payload_bytes, settings.AME_WEBHOOK_SECRET)
        
        headers = {
            "Content-Type": "application/json",
            "X-AME-Signature": signature
        }
        
        logger.info(f"WebhookDispatcher: Sending webhook to {url}")
        
        async with httpx.AsyncClient() as client:
            retry_delay = 1.0 # start with 1 second delay
            for attempt in range(1, max_retries + 1):
                try:
                    response = await client.post(url, content=payload_bytes, headers=headers, timeout=5.0)
                    if response.status_code == 200 or response.status_code == 204:
                        logger.info(f"WebhookDispatcher: Webhook delivered successfully on attempt {attempt}.")
                        return True
                    else:
                        logger.warning(
                            f"WebhookDispatcher: Delivery returned code {response.status_code} "
                            f"on attempt {attempt}."
                        )
                except httpx.RequestError as e:
                    logger.error(f"WebhookDispatcher: Network error on attempt {attempt}: {e}")
                
                if attempt < max_retries:
                    logger.info(f"WebhookDispatcher: Retrying in {retry_delay}s...")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2.0 # exponential backoff
                    
            logger.error("WebhookDispatcher: Webhook delivery failed after maximum retries.")
            return False
