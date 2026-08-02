import redis
import logging
from app.core.config import settings

logger = logging.getLogger("ame.redis")

# We use both sync and async connections depending on the context
# (standard python-redis supports both, we provide a standard connection here)
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    logger.info("Successfully connected to Redis.")
except Exception as e:
    logger.error(f"Failed to connect to Redis: {e}")
    redis_client = None

def get_redis():
    return redis_client
