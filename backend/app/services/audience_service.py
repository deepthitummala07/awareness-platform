
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.audience_member import AudienceMember
from app.schemas.audience import AudienceCreate, AudienceUpdate


def get_audience_member(db: Session, audience_id: int):
    return (
        db.query(AudienceMember)
        .filter(AudienceMember.id == audience_id)
        .first()
    )


def get_audience_list(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    search: str = None,
    language: str = None,
    city: str = None,
    occupation: str = None,
):
    query = db.query(AudienceMember)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                AudienceMember.name.ilike(term),
                AudienceMember.email.ilike(term),
                AudienceMember.phone.ilike(term),
                AudienceMember.city.ilike(term),
            )
        )

    if language:
        query = query.filter(
            AudienceMember.language.ilike(language.strip())
        )

    if city:
        query = query.filter(
            AudienceMember.city.ilike(city.strip())
        )

    if occupation:
        query = query.filter(
            AudienceMember.occupation.ilike(occupation.strip())
        )

    total = query.count()

    members = (
        query.order_by(AudienceMember.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"total": total, "items": members}


def _check_duplicates(
    db: Session,
    email: str = None,
    phone: str = None,
    exclude_id: int = None,
):
    query = db.query(AudienceMember)

    if exclude_id is not None:
        query = query.filter(AudienceMember.id != exclude_id)

    if email and email.strip():
        existing_email = query.filter(
            func.lower(func.trim(AudienceMember.email))
            == email.strip().lower()
        ).first()

        if existing_email:
            raise ValueError("An audience member with this email already exists.")

    if phone and phone.strip():
        existing_phone = query.filter(
            func.trim(AudienceMember.phone) == phone.strip()
        ).first()

        if existing_phone:
            raise ValueError("An audience member with this phone already exists.")


def create_audience_member(db: Session, data: AudienceCreate):
    values = data.model_dump()

    _check_duplicates(
        db,
        email=values.get("email"),
        phone=values.get("phone"),
    )

    member = AudienceMember(**values)
    db.add(member)

    try:
        db.commit()
        db.refresh(member)
        return member
    except Exception:
        db.rollback()
        raise


def update_audience_member(
    db: Session,
    audience_id: int,
    data: AudienceUpdate,
):
    member = get_audience_member(db, audience_id)

    if not member:
        return None

    values = data.model_dump(exclude_unset=True)

    _check_duplicates(
        db,
        email=values.get("email", member.email),
        phone=values.get("phone", member.phone),
        exclude_id=audience_id,
    )

    for field, value in values.items():
        setattr(member, field, value)

    try:
        db.commit()
        db.refresh(member)
        return member
    except Exception:
        db.rollback()
        raise


def delete_audience_member(db: Session, audience_id: int):
    member = get_audience_member(db, audience_id)

    if not member:
        return False

    db.delete(member)
    db.commit()
    return True


def get_audience_stats(db: Session):
    total = db.query(AudienceMember).count()

    languages = (
        db.query(AudienceMember.language, func.count(AudienceMember.id))
        .group_by(AudienceMember.language)
        .all()
    )

    cities = (
        db.query(AudienceMember.city, func.count(AudienceMember.id))
        .filter(AudienceMember.city.isnot(None))
        .group_by(AudienceMember.city)
        .all()
    )

    channels = (
        db.query(
            AudienceMember.preferred_channel,
            func.count(AudienceMember.id),
        )
        .filter(AudienceMember.preferred_channel.isnot(None))
        .group_by(AudienceMember.preferred_channel)
        .all()
    )

    return {
        "total_audience": total,
        "by_language": [
            {"language": key, "count": count}
            for key, count in languages
        ],
        "by_city": [
            {"city": key, "count": count}
            for key, count in cities
        ],
        "by_channel": [
            {"channel": key, "count": count}
            for key, count in channels
        ],
    }
