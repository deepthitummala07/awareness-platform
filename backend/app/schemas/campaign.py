
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


CampaignType = Literal[
    "Awareness",
    "Emergency Alert",
    "Educational",
    "Organizational Announcement",
]

CampaignStatus = Literal[
    "Draft",
    "In Review",
    "Approved",
    "Scheduled",
    "Running",
    "Completed",
    "Failed",
]

CampaignPriority = Literal["Low", "Normal", "High"]


class CampaignBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str | None = None
    campaign_type: CampaignType = "Awareness"
    objective: str | None = None
    target_segments: list[int] = Field(default_factory=list)
    channels: list[str] = Field(default_factory=list)
    start_date: datetime | None = None
    end_date: datetime | None = None
    priority: CampaignPriority = "Normal"


class CampaignCreate(CampaignBase):
    status: CampaignStatus = "Draft"


class CampaignUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    campaign_type: CampaignType | None = None
    objective: str | None = None
    target_segments: list[int] | None = None
    channels: list[str] | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    priority: CampaignPriority | None = None
    status: CampaignStatus | None = None


class CampaignResponse(CampaignBase):
    id: int
    status: str
    created_by: int
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
