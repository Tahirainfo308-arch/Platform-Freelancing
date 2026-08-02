import pytest
import asyncio
import datetime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.models.models import Base, UserScore, JobProfile, TrustScoreHistory
from app.agents.agents import (
    EmbeddingService, AIRankingAgent, AISearchAgent,
    AITrustScoreAgent, AIFraudDetectionAgent, AIReviewVerificationAgent,
    AIVisibilityRotationAgent, AIPortfolioAnalysisAgent
)

# SQLite Async setup for isolation
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture(scope="function")
async def db_session():
    """Provides an isolated in-memory SQLite database session for unit testing."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        yield session
        await session.rollback()
        
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# -------------------------------------------------------------
# Test 1: Embedding Service and Similarity
# -------------------------------------------------------------
def test_embedding_service():
    v1 = EmbeddingService.get_embedding("React Developer Portfolio Pakistan")
    v2 = EmbeddingService.get_embedding("React Developer Portfolio Pakistan")
    v3 = EmbeddingService.get_embedding("Python FastAPI Backend Engineer Lahore")
    
    # Assert deterministic generation
    assert v1 == v2
    assert len(v1) == 1536
    
    similarity_same = EmbeddingService.cosine_similarity(v1, v2)
    similarity_diff = EmbeddingService.cosine_similarity(v1, v3)
    
    assert similarity_same > 0.99
    assert similarity_diff < similarity_same


# -------------------------------------------------------------
# Test 2: AI Trust Score & History Log
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_trust_score_adjustment(db_session: AsyncSession):
    user = UserScore(id="user_123", role="freelancer", name="Test Freelancer", trust_score=70.0)
    db_session.add(user)
    await db_session.commit()
    
    # Adjust trust (e.g. 5-star review +2 points)
    new_score = await AITrustScoreAgent.adjust_trust(db_session, "user_123", 2.0, "5-star rating review")
    assert new_score == 72.0
    
    # Adjust trust (e.g. fraud -20 points penalty)
    new_score = await AITrustScoreAgent.adjust_trust(db_session, "user_123", -20.0, "Fraud Penalty: escrow_bypass")
    assert new_score == 52.0
    
    # Boundaries (min 0, max 100)
    new_score = await AITrustScoreAgent.adjust_trust(db_session, "user_123", 100.0, "Massive boost")
    assert new_score == 100.0


# -------------------------------------------------------------
# Test 3: AI Ranking Logic (Rules compliance check)
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_ranking_logic(db_session: AsyncSession):
    # Setup high-performer
    freelancer = UserScore(
        id="user_elite",
        role="freelancer",
        name="Elite Freelancer",
        trust_score=95.0,
        job_success_rate=98.0,
        portfolio_quality_score=90.0,
        on_time_delivery_rate=100.0,
        repeat_clients_count=8,
        response_time_seconds=60.0, # 1 minute response time
        is_fresh_talent=False,
        availability=True
    )
    db_session.add(freelancer)
    await db_session.commit()
    
    rank = await AIRankingAgent.calculate_ranking(db_session, "user_elite")
    assert rank > 80.0 # High performer rank is solid
    
    # Unavailable multiplier test (reduces rank by 90%)
    freelancer.availability = False
    await db_session.commit()
    degraded_rank = await AIRankingAgent.calculate_ranking(db_session, "user_elite")
    assert degraded_rank == round(rank * 0.1, 2)


# -------------------------------------------------------------
# Test 4: AI Fraud bypass NLP Scanner
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_fraud_bypass_scanner(db_session: AsyncSession):
    user = UserScore(id="user_spammer", role="freelancer", name="Spam Freelancer", trust_score=70.0)
    db_session.add(user)
    await db_session.commit()
    
    # Test message with direct phone details and external billing words
    text_bad = "Hey client, text me directly on WhatsApp at +923001234567 or email me at spam@gmail.com and pay via Paypal direct transfer."
    res = await AIFraudDetectionAgent.scan_activity(db_session, "user_spammer", "message", "msg_123", text_bad)
    
    assert res["fraud_detected"] is True
    assert res["fraud_type"] == "escrow_bypass"
    assert res["confidence"] > 0.90
    
    # Check that trust score was penalized by 20 points
    assert user.trust_score == 50.0


# -------------------------------------------------------------
# Test 5: Review verification logic (Unfair feedback protection)
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_review_verification_unfairness(db_session: AsyncSession):
    # Standard unfair review: 1-star rating but very short arbitrary comments
    comment = "bad"
    res = await AIReviewVerificationAgent.verify_review(
        db_session, "rev_1", "task_1", "client_1", "user_1", 1, comment
    )
    
    assert res["is_unfair"] is True
    assert res["action"] == "mitigate_ranking_impact"


# -------------------------------------------------------------
# Test 6: Visibility Rotation Balancer
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_visibility_rotation(db_session: AsyncSession):
    results = [
        {"id": f"f_{i}", "name": f"Freelancer {i}", "ranking_score": 100.0 - i, "is_fresh_talent": False}
        for i in range(20)
    ]
    
    rotated = await AIVisibilityRotationAgent.rotate_visibility(db_session, results, epsilon=0.10)
    
    # Assert sizes match
    assert len(rotated) == len(results)
    
    # Top elements should still contain high-performing users mostly
    # But shuffle/insertion of exploration elements has occurred in bottom tiers
    assert [x["id"] for x in results[:3]] == [x["id"] for x in rotated[:3]]
