import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserScore(Base):
    __tablename__ = "user_scores"

    id = Column(String, primary_key=True)  # Firebase User ID (UID)
    role = Column(String, nullable=False)   # 'customer' or 'freelancer'
    name = Column(String, nullable=False)
    
    # Trust Score details (0 to 100)
    trust_score = Column(Float, default=70.0)
    trust_penalty = Column(Float, default=0.0)
    
    # Ranking metrics
    ranking_score = Column(Float, default=0.0)
    job_success_rate = Column(Float, default=100.0)
    on_time_delivery_rate = Column(Float, default=100.0)
    response_time_seconds = Column(Float, default=3600.0) # default 1 hour
    repeat_clients_count = Column(Integer, default=0)
    portfolio_quality_score = Column(Float, default=0.0)
    completed_projects_count = Column(Integer, default=0)
    availability = Column(Boolean, default=True)
    
    # Fresh Talent rules
    is_fresh_talent = Column(Boolean, default=True)
    fresh_talent_jobs_count = Column(Integer, default=0) # first 20 jobs boost
    first_impression_count = Column(Integer, default=0)
    first_impression_goal = Column(Integer, default=1000) # visibility guarantee
    
    # Vector embedding representation (Skills, bio, experience)
    # Stored as JSON list of floats for max database portability.
    # Fallback to local numpy similarity if pgvector isn't installed.
    embedding = Column(JSON, nullable=True) 
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    trust_histories = relationship("TrustScoreHistory", back_populates="user")
    ranking_histories = relationship("RankingHistory", back_populates="user")
    skill_verifications = relationship("SkillVerification", back_populates="user")


class JobProfile(Base):
    __tablename__ = "job_profiles"

    id = Column(String, primary_key=True)  # Firebase Task ID
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    budget = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    poster_id = Column(String, nullable=False)
    status = Column(String, default="open") # open, assigned, completed, etc.
    embedding = Column(JSON, nullable=True) # Vector embedding representation
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class TrustScoreHistory(Base):
    __tablename__ = "trust_score_histories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("user_scores.id"), nullable=False)
    old_score = Column(Float, nullable=False)
    new_score = Column(Float, nullable=False)
    change_amount = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserScore", back_populates="trust_histories")


class RankingHistory(Base):
    __tablename__ = "ranking_histories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("user_scores.id"), nullable=False)
    old_score = Column(Float, nullable=False)
    new_score = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserScore", back_populates="ranking_histories")


class ReviewVerification(Base):
    __tablename__ = "review_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    review_id = Column(String, unique=True, nullable=False)
    task_id = Column(String, nullable=False)
    from_user_id = Column(String, nullable=False)
    to_user_id = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    unfairness_probability = Column(Float, default=0.0)
    evidence_summary = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)


class FraudDetectionLog(Base):
    __tablename__ = "fraud_detection_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)  # 'message', 'review', 'profile', 'login'
    entity_id = Column(String, nullable=True)
    fraud_type = Column(String, nullable=False)   # 'escrow_bypass', 'spam', 'vpn', 'bot', 'multiple_accounts', 'plagiarism'
    confidence = Column(Float, nullable=False)
    evidence = Column(Text, nullable=True)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class DisputeAnalysis(Base):
    __tablename__ = "dispute_analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dispute_id = Column(String, unique=True, nullable=False)
    task_id = Column(String, nullable=False)
    client_id = Column(String, nullable=False)
    freelancer_id = Column(String, nullable=False)
    evidence_timeline = Column(JSON, nullable=True) # list of timeline events
    summary = Column(Text, nullable=True)
    recommended_resolution = Column(Text, nullable=True)
    recommended_refund_percentage = Column(Float, default=0.0)
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)


class VisibilityRotationLog(Base):
    __tablename__ = "visibility_rotation_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    search_query = Column(String, nullable=True)
    rank_position = Column(Integer, nullable=True)
    boost_applied = Column(Float, default=0.0)
    exposure_impressions = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SkillVerification(Base):
    __tablename__ = "skill_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("user_scores.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    confidence_score = Column(Float, default=0.0)
    experience_years_analyzed = Column(Float, default=0.0)
    evidence_sources = Column(JSON, nullable=True) # portfolios / projects analyzed
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserScore", back_populates="skill_verifications")


class AnalyticsMetric(Base):
    __tablename__ = "analytics_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    metric_type = Column(String, nullable=False) # 'search_click', 'conversion', 'hiring', 'api_latency'
    meta_data = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class AiLearningLog(Base):
    __tablename__ = "ai_learning_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    feedback_type = Column(String, nullable=False) # 'recommendation_click', 'search_click'
    feedback_details = Column(JSON, nullable=True)
    weight_adjustments = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class OrchestratorLog(Base):
    __tablename__ = "orchestrator_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 'received', 'processing', 'completed', 'failed'
    execution_duration_ms = Column(Integer, default=0)
    agent_decisions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
