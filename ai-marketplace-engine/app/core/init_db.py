import logging
from app.core.database import engine, Base
from app.models.models import UserScore, JobProfile, TrustScoreHistory, RankingHistory, ReviewVerification, FraudDetectionLog, DisputeAnalysis, VisibilityRotationLog, SkillVerification, AnalyticsMetric, AiLearningLog, OrchestratorLog

logger = logging.getLogger("ame.init_db")

async def init_models():
    """Create PostgreSQL tables if they don't already exist."""
    async with engine.begin() as conn:
        logger.info("Initializing database tables...")
        # create_all is a blocking function, run_sync runs it in a threadpool
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully.")
