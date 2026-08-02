import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.AME_HOST,
        port=settings.AME_PORT,
        reload=settings.AME_DEBUG
    )
