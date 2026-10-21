
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse
from app.services import campaign_service

# Adjust these imports if your existing authentication dependencies use different names.
from app.core.security import get_current_user

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("/", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(
    data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return campaign_service.create_campaign(db, data, current_user.id)


@router.get("/")
def list_campaigns(
    search: str | None = None,
    campaign_status: str | None = Query(default=None, alias="status"),
    campaign_type: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = campaign_service.get_campaigns(
        db,
        search=search,
        status=campaign_status,
        campaign_type=campaign_type,
        skip=skip,
        limit=limit,
    )
    return {
        "total": result["total"],
        "items": [
            CampaignResponse.model_validate(item)
            for item in result["items"]
        ],
    }


@router.get("/{campaign_id}", response_model=CampaignResponse)
def read_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = campaign_service.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.put("/{campaign_id}", response_model=CampaignResponse)
def edit_campaign(
    campaign_id: int,
    data: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = campaign_service.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign_service.update_campaign(db, campaign, data)


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = campaign_service.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign_service.delete_campaign(db, campaign)


@router.patch("/{campaign_id}/status", response_model=CampaignResponse)
def update_status(
    campaign_id: int,
    new_status: Literal[
        "Draft", "In Review", "Approved", "Scheduled",
        "Running", "Completed", "Failed"
    ],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = campaign_service.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign_service.change_campaign_status(db, campaign, new_status)


@router.post("/{campaign_id}/clone", response_model=CampaignResponse, status_code=201)
def clone_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    campaign = campaign_service.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    return campaign_service.clone_campaign(db, campaign, current_user.id)
