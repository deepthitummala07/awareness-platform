
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.segment import Segment
from app.schemas.segment import (
    SegmentCreate,
    SegmentUpdate,
    SegmentResponse,
    SegmentPreviewRequest,
)
from app.services.segment_service import (
    build_segment_query,
    preview_segment,
    get_segment_members,
)

router = APIRouter(prefix="/segments", tags=["Segments"])


def validate_rules(filter_rules):
    try:
        # Validate every rule before saving or querying.
        from app.services.segment_service import build_condition

        for rule in filter_rules.get("rules", []):
            build_condition(rule)
    except (ValueError, AttributeError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@router.post("/preview")
def preview(request: SegmentPreviewRequest, db: Session = Depends(get_db)):
    rules = request.filter_rules.model_dump()
    validate_rules(rules)

    try:
        return preview_segment(db, rules, request.limit)
    except (ValueError, TypeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@router.post("/", response_model=SegmentResponse, status_code=status.HTTP_201_CREATED)
def create_segment(request: SegmentCreate, db: Session = Depends(get_db)):
    rules = request.filter_rules.model_dump()
    validate_rules(rules)

    segment = Segment(
        name=request.name.strip(),
        description=request.description,
        language=request.language,
        filter_rules=rules,
    )
    db.add(segment)

    try:
        db.commit()
        db.refresh(segment)
        return segment
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A segment with this name already exists.",
        )


@router.get("/")
def list_segments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    segments = (
        db.query(Segment)
        .order_by(Segment.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for segment in segments:
        rules = segment.filter_rules or {"combination": "AND", "rules": []}
        try:
            count = build_segment_query(db, rules).count()
        except (ValueError, TypeError, AttributeError):
            count = None

        results.append({
            "id": segment.id,
            "name": segment.name,
            "description": segment.description,
            "language": segment.language,
            "filter_rules": rules,
            "size": count,
        })

    total = db.query(Segment).count()
    return {"total": total, "items": results}


@router.get("/{segment_id}", response_model=SegmentResponse)
def get_segment(segment_id: int, db: Session = Depends(get_db)):
    segment = db.query(Segment).filter(Segment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found.")

    return segment


@router.put("/{segment_id}", response_model=SegmentResponse)
def update_segment(
    segment_id: int,
    request: SegmentUpdate,
    db: Session = Depends(get_db),
):
    segment = db.query(Segment).filter(Segment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found.")

    changes = request.model_dump(exclude_unset=True)

    if "name" in changes and changes["name"] is not None:
        changes["name"] = changes["name"].strip()


    if "filter_rules" in changes and changes["filter_rules"] is not None:
        if hasattr(changes["filter_rules"], "model_dump"):
            changes["filter_rules"] = changes["filter_rules"].model_dump()
        validate_rules(changes["filter_rules"])

    for key, value in changes.items():
        setattr(segment, key, value)

    try:
        db.commit()
        db.refresh(segment)
        return segment
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="A segment with this name already exists.",
        )


@router.delete("/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_segment(segment_id: int, db: Session = Depends(get_db)):
    segment = db.query(Segment).filter(Segment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found.")

    db.delete(segment)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{segment_id}/members")
def list_segment_members(
    segment_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    segment = db.query(Segment).filter(Segment.id == segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found.")

    rules = segment.filter_rules or {"combination": "AND", "rules": []}

    try:
        return get_segment_members(db, rules, skip, limit)
    except (ValueError, TypeError, AttributeError) as exc:
        raise HTTPException(status_code=422, detail=str(exc))
