
from sqlalchemy import Column, Integer, String, Text, JSON
from app.core.database import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)

    # Template details
    name = Column(String(100), nullable=False)
    title = Column(String(150), nullable=True)
    category = Column(String(50), nullable=False, default="General")

    # Content and localization
    language = Column(String(50), nullable=False)
    channel = Column(String(30), nullable=False)
    content = Column(Text, nullable=False)

    # Searchable labels
    tags = Column(JSON, nullable=True, default=list)
