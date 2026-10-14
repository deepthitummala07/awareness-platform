
from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class AudienceMember(Base):
    __tablename__ = "audience_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    language = Column(String(50), nullable=False, default="English")
    segment_id = Column(Integer, ForeignKey("segments.id"), nullable=True)
