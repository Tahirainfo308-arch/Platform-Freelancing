from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Optional
import time

from app.core.database import get_db
from app.core.security import verify_api_key
from app.orchestrator.orchestrator import MarketplaceAIOrchestrator
from app.models.models import UserScore, JobProfile, OrchestratorLog
from app.agents.agents import (
    AIRankingAgent, AISearchAgent, AITrustScoreAgent,
    AIRecommendationAgent, AIVisibilityRotationAgent,
    AIAnalyticsAgent, AIOpsAgent
)

router = APIRouter()

# -------------------------------------------------------------
# Event Streaming & Ingestion Endpoints (Secured by API Key)
# -------------------------------------------------------------
@router.post("/events/user-created", status_code=status.HTTP_202_ACCEPTED)
async def event_user_created(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of user registration."""
    if "uid" not in payload or "role" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical fields: uid, role.")
    res = await MarketplaceAIOrchestrator.route_event("user-created", payload)
    return res

@router.post("/events/job-created", status_code=status.HTTP_202_ACCEPTED)
async def event_job_created(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of job creation."""
    if "job_id" not in payload or "title" not in payload or "description" not in payload or "category" not in payload or "poster_id" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical fields: job_id, title, description, category, poster_id.")
    res = await MarketplaceAIOrchestrator.route_event("job-created", payload)
    return res

@router.post("/events/proposal-submitted", status_code=status.HTTP_202_ACCEPTED)
async def event_proposal_submitted(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of job proposal submissions."""
    if "proposal_id" not in payload or "freelancer_id" not in payload or "task_id" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical fields: proposal_id, freelancer_id, task_id.")
    res = await MarketplaceAIOrchestrator.route_event("proposal-submitted", payload)
    return res

@router.post("/events/order-started", status_code=status.HTTP_202_ACCEPTED)
async def event_order_started(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of order kickstarts."""
    if "task_id" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical field: task_id.")
    res = await MarketplaceAIOrchestrator.route_event("order-started", payload)
    return res

@router.post("/events/order-completed", status_code=status.HTTP_202_ACCEPTED)
async def event_order_completed(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of order deliverables approval."""
    if "task_id" not in payload or "freelancer_id" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical fields: task_id, freelancer_id.")
    res = await MarketplaceAIOrchestrator.route_event("order-completed", payload)
    return res

@router.post("/events/review-created", status_code=status.HTTP_202_ACCEPTED)
async def event_review_created(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of double-blind review completion."""
    if "review_id" not in payload or "task_id" not in payload or "from_id" not in payload or "to_id" not in payload or "rating" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical fields: review_id, task_id, from_id, to_id, rating.")
    res = await MarketplaceAIOrchestrator.route_event("review-created", payload)
    return res

@router.post("/events/dispute-created", status_code=status.HTTP_202_ACCEPTED)
async def event_dispute_created(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of buyer/provider disputes."""
    if "dispute_id" not in payload or "task_id" not in payload or "client_id" not in payload or "freelancer_id" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical fields: dispute_id, task_id, client_id, freelancer_id.")
    res = await MarketplaceAIOrchestrator.route_event("dispute-created", payload)
    return res

@router.post("/events/profile-updated", status_code=status.HTTP_202_ACCEPTED)
async def event_profile_updated(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of user profile modifications."""
    if "uid" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical field: uid.")
    res = await MarketplaceAIOrchestrator.route_event("profile-updated", payload)
    return res

@router.post("/events/login", status_code=status.HTTP_202_ACCEPTED)
async def event_login(payload: Dict[str, Any], api_key: str = Depends(verify_api_key)):
    """Receives event notifying of logins."""
    if "uid" not in payload:
        raise HTTPException(status_code=400, detail="Missing critical field: uid.")
    res = await MarketplaceAIOrchestrator.route_event("login", payload)
    return res


# -------------------------------------------------------------
# Read & Query APIs (Can be accessed by marketplace for views)
# -------------------------------------------------------------
@router.get("/ranking")
async def get_ranking(user_id: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Fetches global ranking parameters for a freelancer."""
    result = await db.execute(select(UserScore).where(UserScore.id == user_id))
    user: Optional[UserScore] = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User score details not found.")
        
    return {
        "user_id": user.id,
        "name": user.name,
        "ranking_score": user.ranking_score,
        "job_success_rate": user.job_success_rate,
        "trust_score": user.trust_score,
        "portfolio_quality": user.portfolio_quality_score,
        "is_fresh_talent": user.is_fresh_talent,
        "availability": user.availability
    }

@router.get("/trust-score")
async def get_trust_score(user_id: str = Query(...), db: AsyncSession = Depends(get_db)):
    """Fetches trust score specifications for a user."""
    result = await db.execute(select(UserScore).where(UserScore.id == user_id))
    user: Optional[UserScore] = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User trust details not found.")
        
    return {
        "user_id": user.id,
        "name": user.name,
        "trust_score": user.trust_score,
        "trust_penalty": user.trust_penalty
    }

@router.get("/recommendations")
async def get_recommendations(user_id: str = Query(...), rec_type: str = Query("jobs"), limit: int = Query(5), db: AsyncSession = Depends(get_db)):
    """Generates recommendations for jobs or freelancers."""
    recs = await AIRecommendationAgent.get_recommendations(db, user_id, rec_type, limit)
    return {
        "user_id": user_id,
        "type": rec_type,
        "recommendations": recs
    }

@router.get("/search")
async def get_search(q: str = Query(...), role: str = Query("freelancer"), limit: int = Query(10), db: AsyncSession = Depends(get_db)):
    """Performs semantic search with epsilon-greedy rotation."""
    raw_results = await AISearchAgent.semantic_search(db, q, role, limit)
    
    # Apply Visibility Rotation balancer (10% epsilon rotation)
    rotated_results = await AIVisibilityRotationAgent.rotate_visibility(db, raw_results, epsilon=0.1)
    
    # Increment Fresh Talent visibility metric if applicable
    for r in rotated_results:
        if r.get("is_fresh_talent"):
            # Increment impression asynchronously
            await AIFreshTalentAgent.increment_impression(db, r["id"])
            
    await db.commit()
    return rotated_results

@router.get("/analytics")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    """Retrieves marketplace engine metrics and analytics summaries."""
    report = await AIAnalyticsAgent.generate_report(db)
    return report

@router.get("/health")
async def get_health(db: AsyncSession = Depends(get_db)):
    """Verifies that API endpoints and database are ready."""
    try:
        # Check database execution
        await db.execute(select(1))
        return {
            "status": "HEALTHY",
            "database": "CONNECTED",
            "timestamp": time.time()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection degraded: {str(e)}"
        )
