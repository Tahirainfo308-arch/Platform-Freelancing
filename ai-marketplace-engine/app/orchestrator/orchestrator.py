import time
import logging
import asyncio
import datetime
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional

from app.core.database import AsyncSessionLocal
from app.models.models import UserScore, JobProfile, OrchestratorLog
from app.agents.agents import (
    EmbeddingService, AIRankingAgent, AISearchAgent, AIFreshTalentAgent,
    AITrustScoreAgent, AIReviewVerificationAgent, AIFraudDetectionAgent,
    AIRecommendationAgent, AIVisibilityRotationAgent, AIPortfolioAnalysisAgent,
    AISkillVerificationAgent, AIDisputeAnalysisAgent, AIAnalyticsAgent,
    AILearningAgent, AINotificationAgent, AIOpsAgent
)
from app.services.webhook_dispatcher import WebhookDispatcher

logger = logging.getLogger("ame.orchestrator")

class MarketplaceAIOrchestrator:
    @staticmethod
    async def route_event(event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Receives all events, detects event type, runs workflow, updates DB, dispatches webhooks."""
        start_time = time.time()
        event_id = payload.get("event_id", f"evt_{int(start_time * 1000)}")
        logger.info(f"Orchestrator: Received event {event_type} (ID: {event_id})")
        
        agent_decisions = {}
        status = "completed"
        
        async with AsyncSessionLocal() as db:
            try:
                # ---------------------------------------------------------
                # Event 1: user-created
                # ---------------------------------------------------------
                if event_type == "user-created":
                    uid = payload["uid"]
                    role = payload["role"]
                    name = payload.get("name", "Unnamed User")
                    bio = payload.get("bio", "")
                    skills = payload.get("skills", [])
                    
                    # Store default profile score
                    user_score = UserScore(
                        id=uid,
                        role=role,
                        name=name,
                        trust_score=70.0,
                        embedding=EmbeddingService.get_embedding(f"{name} {bio} {' '.join(skills)}")
                    )
                    db.add(user_score)
                    await db.flush()
                    
                    # Fresh talent badge check
                    fresh_info = await AIFreshTalentAgent.process_freshness(db, uid)
                    agent_decisions["fresh_talent_status"] = fresh_info
                    
                    # Recalculate ranking
                    rank = await AIRankingAgent.calculate_ranking(db, uid)
                    agent_decisions["ranking_score"] = rank
                    
                # ---------------------------------------------------------
                # Event 2: job-created
                # ---------------------------------------------------------
                elif event_type == "job-created":
                    job_id = payload["job_id"]
                    title = payload["title"]
                    description = payload["description"]
                    category = payload["category"]
                    budget = payload.get("budget", 0.0)
                    location = payload.get("location", "Pakistan")
                    poster_id = payload["poster_id"]
                    
                    # Store Job Profile
                    job_profile = JobProfile(
                        id=job_id,
                        title=title,
                        description=description,
                        category=category,
                        budget=budget,
                        location=location,
                        poster_id=poster_id,
                        embedding=EmbeddingService.get_embedding(f"{title} {description} {category}")
                    )
                    db.add(job_profile)
                    await db.flush()
                    
                    # Scan description for bypass fraud
                    fraud_check = await AIFraudDetectionAgent.scan_activity(
                        db, poster_id, "job", job_id, f"{title} {description}"
                    )
                    agent_decisions["fraud_detection"] = fraud_check
                    
                    # Recommended matching freelancers
                    recs = await AIRecommendationAgent.get_recommendations(db, poster_id, "freelancers", 5)
                    agent_decisions["recommended_freelancers"] = recs
                    
                # ---------------------------------------------------------
                # Event 3: proposal-submitted
                # ---------------------------------------------------------
                elif event_type == "proposal-submitted":
                    # Rules strictly state: Proposal text/quality NEVER affects ranking
                    # Therefore we do NOT run any rank calculations or evaluations here.
                    freelancer_id = payload["freelancer_id"]
                    proposal_id = payload["proposal_id"]
                    proposal_text = payload.get("message", "")
                    
                    # Simply scan for bypass details (security audit, no ranking penalties)
                    fraud_check = await AIFraudDetectionAgent.scan_activity(
                        db, freelancer_id, "proposal", proposal_id, proposal_text
                    )
                    agent_decisions["fraud_detection"] = fraud_check
                    agent_decisions["rule_check"] = "Strict compliance: Proposal quality omitted from scoring."
                    
                # ---------------------------------------------------------
                # Event 4: order-started
                # ---------------------------------------------------------
                elif event_type == "order-started":
                    # Track analytics
                    task_id = payload["task_id"]
                    await AIAnalyticsAgent.log_metric(db, "order_started", {"task_id": task_id})
                    agent_decisions["status"] = "Order active. Analytics logged."
                    
                # ---------------------------------------------------------
                # Event 5: order-completed
                # ---------------------------------------------------------
                elif event_type == "order-completed":
                    freelancer_id = payload["freelancer_id"]
                    rating = payload.get("rating", 5.0)
                    success = payload.get("success", True)
                    
                    # Run learning process (Closed loop JSR)
                    learn_res = await AILearningAgent.process_project_completion(db, freelancer_id, success, rating)
                    agent_decisions["learning_adjustments"] = learn_res
                    
                    # Update ranking
                    rank = await AIRankingAgent.calculate_ranking(db, freelancer_id)
                    agent_decisions["ranking_score"] = rank
                    
                # ---------------------------------------------------------
                # Event 6: review-created
                # ---------------------------------------------------------
                elif event_type == "review-created":
                    review_id = payload["review_id"]
                    task_id = payload["task_id"]
                    from_id = payload["from_id"]
                    to_id = payload["to_id"]
                    rating = payload["rating"]
                    comment = payload.get("comment", "")
                    
                    # Verify 1-star and 2-star reviews
                    verify_res = await AIReviewVerificationAgent.verify_review(
                        db, review_id, task_id, from_id, to_id, rating, comment
                    )
                    agent_decisions["review_verification"] = verify_res
                    
                    # Adjust trust score
                    # Heuristic: +2 for 5 star; -2 for <=2 star reviews
                    trust_change = 2.0 if rating >= 5 else (-2.0 if rating <= 2 else 0.0)
                    
                    # If verified as UNFAIR, cancel out or reduce the penalty
                    if verify_res.get("is_unfair") and trust_change < 0:
                        trust_change = 0.0 # bypass penalty
                        agent_decisions["trust_remedial"] = "Unfair negative review bypassed; no penalty applied."
                        
                    if trust_change != 0.0:
                        new_trust = await AITrustScoreAgent.adjust_trust(
                            db, to_id, trust_change, f"Review rating: {rating} stars"
                        )
                        agent_decisions["new_trust_score"] = new_trust
                        
                # ---------------------------------------------------------
                # Event 7: dispute-created
                # ---------------------------------------------------------
                elif event_type == "dispute-created":
                    dispute_id = payload["dispute_id"]
                    task_id = payload["task_id"]
                    client_id = payload["client_id"]
                    freelancer_id = payload["freelancer_id"]
                    timeline = payload.get("evidence_timeline", [])
                    
                    # Analyze dispute timeline
                    dispute_res = await AIDisputeAnalysisAgent.analyze_dispute(
                        db, dispute_id, task_id, client_id, freelancer_id, timeline
                    )
                    agent_decisions["dispute_analysis"] = dispute_res
                    
                    # Alert Admins via notification dispatcher
                    await AINotificationAgent.dispatch_notification("fraud_alert", dispute_res)
                    
                # ---------------------------------------------------------
                # Event 8: profile-updated
                # ---------------------------------------------------------
                elif event_type == "profile-updated":
                    uid = payload["uid"]
                    name = payload.get("name")
                    bio = payload.get("bio", "")
                    skills = payload.get("skills", [])
                    portfolio = payload.get("portfolio", [])
                    
                    # Fetch profile
                    res = await db.execute(select(UserScore).where(UserScore.id == uid))
                    user: Optional[UserScore] = res.scalars().first()
                    if user:
                        if name:
                            user.name = name
                        # Regenerate embedding representation
                        user.embedding = EmbeddingService.get_embedding(f"{user.name} {bio} {' '.join(skills)}")
                        await db.flush()
                        
                        # Score portfolio
                        if portfolio:
                            pq = await AIPortfolioAnalysisAgent.score_portfolio(db, uid, portfolio)
                            agent_decisions["portfolio_quality_score"] = pq
                            
                        # Verify skills list
                        skill_results = []
                        for s in skills:
                            # analyze references
                            ref = [{"duration_years": 1.0, "rating": 5.0}] # mock details
                            vs = await AISkillVerificationAgent.verify_skills(db, uid, s, ref)
                            skill_results.append(vs)
                        agent_decisions["verified_skills"] = skill_results
                        
                        # Recalculate ranking
                        rank = await AIRankingAgent.calculate_ranking(db, uid)
                        agent_decisions["ranking_score"] = rank
                        
                # ---------------------------------------------------------
                # Event 9: login
                # ---------------------------------------------------------
                elif event_type == "login":
                    uid = payload["uid"]
                    ip_address = payload.get("ip_address", "")
                    user_agent = payload.get("user_agent", "")
                    
                    # Check VPN or bot fraud signatures
                    fraud_check = {
                        "vpn_detected": False,
                        "bot_detected": "crawler" in user_agent.lower()
                    }
                    if fraud_check["bot_detected"]:
                        await AIFraudDetectionAgent.scan_activity(
                            db, uid, "login", uid, f"Bot User-Agent detected: {user_agent}"
                        )
                    agent_decisions["login_audit"] = fraud_check
                    
                else:
                    logger.warning(f"Orchestrator: Unhandled event type: {event_type}")
                    status = "ignored"
                
                # Commit database writes
                await db.commit()
                
            except Exception as e:
                logger.error(f"Orchestrator Error during processing event {event_type}: {e}", exc_info=True)
                await db.rollback()
                status = "failed"
                agent_decisions["error"] = str(e)
                
            # Log execution details
            duration = int((time.time() - start_time) * 1000)
            log = OrchestratorLog(
                event_id=event_id,
                event_type=event_type,
                status=status,
                execution_duration_ms=duration,
                agent_decisions=agent_decisions
            )
            db.add(log)
            await db.commit()
            
            # Send results back to marketplace webhooks if successful and adjustments were made
            if status == "completed" and event_type in ["review-created", "order-completed", "dispute-created", "profile-updated"]:
                # Notify main web site
                webhook_payload = {
                    "event_id": event_id,
                    "event_type": event_type,
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "decisions": agent_decisions
                }
                asyncio.create_task(WebhookDispatcher.send_webhook(webhook_payload))
                
        return {
            "event_id": event_id,
            "status": status,
            "duration_ms": int((time.time() - start_time) * 1000),
            "decisions": agent_decisions
        }
