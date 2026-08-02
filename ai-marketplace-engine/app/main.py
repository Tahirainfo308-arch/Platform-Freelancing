from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
import logging
import os

from app.core.config import settings
from app.core.init_db import init_models
from app.api.endpoints import router as api_router
from app.agents.agents import AIOpsAgent

# Setup logging configuration
logging.basicConfig(
    level=logging.INFO if not settings.AME_DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ame.main")

# Initialize FastAPI application
app = FastAPI(
    title="AI Marketplace Engine (AME)",
    description="Enterprise AI Subsystem for fixed-price freelancing marketplaces",
    version="1.0.0",
    docs_url="/docs" if settings.AME_DEBUG else None,
    redoc_url="/redoc" if settings.AME_DEBUG else None
)

# Configure CORS for plug-and-play integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API routes
app.include_router(api_router, prefix="/api")

# Scaffold directories for static/dashboard templates
os.makedirs("app/static", exist_ok=True)
os.makedirs("app/templates", exist_ok=True)

# Mount static files folder
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# On Startup hook
@app.on_event("startup")
async def startup_event():
    logger.info("Starting AI Marketplace Engine...")
    # Initialize PostgreSQL schemas
    try:
        await init_models()
        logger.info("Database schemas verified.")
    except Exception as e:
        logger.critical(f"Database schema initialization failed: {e}", exc_info=True)


# -------------------------------------------------------------
# AME Dashboard (Independent Web View served directly)
# -------------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
async def serve_dashboard(request: Request):
    """Serves the premium AME Administration and Operations dashboard."""
    metrics = await AIOpsAgent.get_system_metrics()
    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request,
            "metrics": metrics,
            "debug_mode": settings.AME_DEBUG,
            "postgres_url": settings.DATABASE_URL.split("@")[-1], # redact credentials
            "redis_url": settings.REDIS_URL.split("@")[-1]
        }
    )
