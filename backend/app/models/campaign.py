
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    event,
)
from sqlalchemy.sql import func
from app.core.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)

    # Basic information
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    campaign_type = Column(String(50), nullable=False, default="Awareness")
    objective = Column(Text, nullable=True)

    # Audience and communication
    target_segments = Column(JSON, nullable=True, default=list)
    channels = Column(JSON, nullable=True, default=list)

    # Schedule and priority
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(String(20), nullable=False, default="Normal")

    # Workflow status
    status = Column(String(30), nullable=False, default="Draft")

    # Ownership and timestamps
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=True,
    )


@event.listens_for(Campaign, "before_insert")
@event.listens_for(Campaign, "before_update")
def set_emergency_priority(mapper, connection, target):
    if target.campaign_type and target.campaign_type.lower() == "emergency alert":
        target.priority = "High"
