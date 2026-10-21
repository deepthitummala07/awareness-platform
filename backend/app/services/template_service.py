
import re

from sqlalchemy.orm import Session

from app.models.template import Template
from app.schemas.template import (
    TemplateCreate,
    TemplateUpdate,
    TemplatePreviewRequest,
)


def create_template(db: Session, data: TemplateCreate) -> Template:
    template = Template(**data.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


def get_templates(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    language: str | None = None,
    channel: str | None = None,
    skip: int = 0,
    limit: int = 10,
):
    query = db.query(Template)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            Template.name.ilike(pattern)
            | Template.title.ilike(pattern)
            | Template.content.ilike(pattern)
        )

    if category:
        query = query.filter(Template.category == category)

    if language:
        query = query.filter(Template.language == language)

    if channel:
        query = query.filter(Template.channel == channel)

    total = query.count()
    items = (
        query.order_by(Template.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"total": total, "items": items}


def get_template(db: Session, template_id: int):
    return db.query(Template).filter(Template.id == template_id).first()


def update_template(
    db: Session,
    template: Template,
    data: TemplateUpdate,
) -> Template:
    changes = data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        setattr(template, field, value)

    db.commit()
    db.refresh(template)
    return template


def delete_template(db: Session, template: Template) -> None:
    db.delete(template)
    db.commit()


def preview_template(data: TemplatePreviewRequest) -> dict:
    placeholders = sorted(set(re.findall(r"\{([a-zA-Z_][a-zA-Z0-9_]*)\}", data.content)))

    preview = data.content
    for key, value in data.sample_data.items():
        preview = preview.replace("{" + key + "}", value)

    return {
        "original_content": data.content,
        "preview_content": preview,
        "placeholders": placeholders,
    }
