
from sqlalchemy import Column, Integer, String, Text, JSON
from app.core.database import Base


class Segment(Base):
    __tablename__ = "segments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(50), nullable=True)

    # Stores the audience filtering rules as JSON
    filter_rules = Column(JSON, nullable=True)
