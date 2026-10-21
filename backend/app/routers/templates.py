
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.template import (
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    TemplatePreviewRequest,
    TemplatePreviewResponse,
)
from app.services import template_service
from app.core.security import get_current_user

router = APIRouter(prefix="/templates", tags=["Templates"])


@router.post("/", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
def create_template(
    data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return template_service.create_template(db, data)


@router.get("/")
def list_templates(
    search: str | None = None,
    category: str | None = None,
    language: str | None = None,
    channel: str | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = template_service.get_templates(
        db,
        search=search,
        category=category,
        language=language,
        channel=channel,
        skip=skip,
        limit=limit,
    )

    return {
        "total": result["total"],
        "items": [
            TemplateResponse.model_validate(item)
            for item in result["items"]
        ],
    }


@router.get("/{template_id}", response_model=TemplateResponse)
def read_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = template_service.get_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
def edit_template(
    template_id: int,
    data: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = template_service.get_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return template_service.update_template(db, template, data)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = template_service.get_template(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    template_service.delete_template(db, template)


@router.post("/preview", response_model=TemplatePreviewResponse)
def preview_template(
    data: TemplatePreviewRequest,
    current_user: User = Depends(get_current_user),
):
    return template_service.preview_template(data)
