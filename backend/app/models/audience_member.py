
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Boolean,
    UniqueConstraint,
)
from app.core.database import Base


class AudienceMember(Base):
    __tablename__ = "audience_members"

    __table_args__ = (
        UniqueConstraint("email", name="uq_audience_email"),
        UniqueConstraint("phone", name="uq_audience_phone"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(30), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True)
    language = Column(String(50), nullable=False, default="English", index=True)
    occupation = Column(String(100), nullable=True)
    organization_department = Column(String(150), nullable=True)
    preferred_channel = Column(String(50), nullable=True, index=True)
    consent_status = Column(Boolean, nullable=False, default=False)
    segment_id = Column(Integer, ForeignKey("segments.id"), nullable=True)
