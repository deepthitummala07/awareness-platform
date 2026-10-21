
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SegmentRules(BaseModel):
    combination: str = "AND"
    rules: list[dict[str, Any]] = Field(default_factory=list)

    @field_validator("combination")
    @classmethod
    def validate_combination(cls, value):
        value = value.upper()
        if value not in {"AND", "OR"}:
            raise ValueError("Combination must be AND or OR.")
        return value


class SegmentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    language: Optional[str] = Field(None, max_length=50)
    filter_rules: SegmentRules


class SegmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    language: Optional[str] = Field(None, max_length=50)
    filter_rules: Optional[SegmentRules] = None


class SegmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    language: Optional[str] = None
    filter_rules: Optional[dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class SegmentPreviewRequest(BaseModel):
    filter_rules: SegmentRules
    limit: int = Field(default=10, ge=1, le=100)
