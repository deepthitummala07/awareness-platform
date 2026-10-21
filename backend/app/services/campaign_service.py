
from sqlalchemy.orm import Session

from app.models.campaign import Campaign
from app.schemas.campaign import CampaignCreate, CampaignUpdate


def create_campaign(
    db: Session,
    data: CampaignCreate,
    user_id: int,
) -> Campaign:
    campaign_data = data.model_dump()

    if campaign_data["campaign_type"] == "Emergency Alert":
        campaign_data["priority"] = "High"

    campaign = Campaign(
        **campaign_data,
        created_by=user_id,
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return campaign


def get_campaigns(
    db: Session,
    search: str | None = None,
    status: str | None = None,
    campaign_type: str | None = None,
    skip: int = 0,
    limit: int = 10,
):
    query = db.query(Campaign)

    if search:
        query = query.filter(Campaign.name.ilike(f"%{search}%"))

    if status:
        query = query.filter(Campaign.status == status)

    if campaign_type:
        query = query.filter(Campaign.campaign_type == campaign_type)

    total = query.count()

    campaigns = (
        query.order_by(Campaign.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"total": total, "items": campaigns}


def get_campaign(db: Session, campaign_id: int):
    return db.query(Campaign).filter(Campaign.id == campaign_id).first()


def update_campaign(
    db: Session,
    campaign: Campaign,
    data: CampaignUpdate,
) -> Campaign:
    changes = data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(campaign, field, value)

    if campaign.campaign_type == "Emergency Alert":
        campaign.priority = "High"

    db.commit()
    db.refresh(campaign)

    return campaign


def delete_campaign(db: Session, campaign: Campaign) -> None:
    db.delete(campaign)
    db.commit()


def change_campaign_status(
    db: Session,
    campaign: Campaign,
    status: str,
) -> Campaign:
    campaign.status = status
    db.commit()
    db.refresh(campaign)

    return campaign


def clone_campaign(
    db: Session,
    campaign: Campaign,
    user_id: int,
) -> Campaign:
    new_campaign = Campaign(
        name=f"{campaign.name} (Copy)",
        description=campaign.description,
        campaign_type=campaign.campaign_type,
        objective=campaign.objective,
        target_segments=campaign.target_segments,
        channels=campaign.channels,
        start_date=campaign.start_date,
        end_date=campaign.end_date,
        priority=(
            "High"
            if campaign.campaign_type == "Emergency Alert"
            else campaign.priority
        ),
        status="Draft",
        created_by=user_id,
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    return new_campaign
