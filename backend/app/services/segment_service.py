
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.audience_member import AudienceMember


# Fields that users are allowed to filter on
ALLOWED_FIELDS = {
    "age": AudienceMember.age,
    "gender": AudienceMember.gender,
    "city": AudienceMember.city,
    "state": AudienceMember.state,
    "language": AudienceMember.language,
    "occupation": AudienceMember.occupation,
    "organization_department": AudienceMember.organization_department,
    "preferred_channel": AudienceMember.preferred_channel,
    "consent_status": AudienceMember.consent_status,
}

ALLOWED_OPERATORS = {
    "equals",
    "not_equals",
    "greater_than",
    "greater_than_or_equal",
    "less_than",
    "less_than_or_equal",
    "contains",
    "in",
    "is_empty",
    "is_not_empty",
}


def build_condition(rule: dict):
    """Convert one validated rule into a SQLAlchemy condition."""
    field = rule.get("field")
    operator = rule.get("operator")
    value = rule.get("value")

    if field not in ALLOWED_FIELDS:
        raise ValueError(f"Unsupported filter field: {field}")

    if operator not in ALLOWED_OPERATORS:
        raise ValueError(f"Unsupported operator: {operator}")

    column = ALLOWED_FIELDS[field]

    if operator == "is_empty":
        return column.is_(None)

    if operator == "is_not_empty":
        return column.is_not(None)

    if value is None:
        raise ValueError(f"A value is required for operator '{operator}'.")

    if operator == "equals":
        return column == value

    if operator == "not_equals":
        return column != value

    if operator == "greater_than":
        if field not in {"age"}:
            raise ValueError(f"'{operator}' is only supported for age.")
        return column > value

    if operator == "greater_than_or_equal":
        if field not in {"age"}:
            raise ValueError(f"'{operator}' is only supported for age.")
        return column >= value

    if operator == "less_than":
        if field not in {"age"}:
            raise ValueError(f"'{operator}' is only supported for age.")
        return column < value

    if operator == "less_than_or_equal":
        if field not in {"age"}:
            raise ValueError(f"'{operator}' is only supported for age.")
        return column <= value

    if operator == "contains":
        if not isinstance(value, str):
            raise ValueError("'contains' requires a text value.")
        return column.ilike(f"%{value}%")

    if operator == "in":
        if not isinstance(value, list) or not value:
            raise ValueError("'in' requires a non-empty list of values.")
        return column.in_(value)

    raise ValueError(f"Unsupported operator: {operator}")


def build_segment_query(db: Session, filter_rules: dict):
    """
    Example:
    {
        "combination": "AND",
        "rules": [
            {"field": "language", "operator": "equals", "value": "Tamil"},
            {"field": "age", "operator": "greater_than", "value": 40}
        ]
    }
    """
    if not isinstance(filter_rules, dict):
        raise ValueError("Filter rules must be an object.")

    rules = filter_rules.get("rules", [])
    combination = str(filter_rules.get("combination", "AND")).upper()

    if combination not in {"AND", "OR"}:
        raise ValueError("Combination must be AND or OR.")

    if not isinstance(rules, list):
        raise ValueError("'rules' must be a list.")

    if not rules:
        return db.query(AudienceMember)

    conditions = [build_condition(rule) for rule in rules]

    if combination == "AND":
        return db.query(AudienceMember).filter(and_(*conditions))

    return db.query(AudienceMember).filter(or_(*conditions))


def preview_segment(
    db: Session,
    filter_rules: dict,
    limit: int = 10,
):
    """Return the matching count and a sample of audience members."""
    if not 1 <= limit <= 100:
        raise ValueError("Preview limit must be between 1 and 100.")

    query = build_segment_query(db, filter_rules)

    total = query.count()
    members = query.order_by(AudienceMember.id.asc()).limit(limit).all()

    return {
        "total": total,
        "sample": [
            {
                "id": member.id,
                "name": member.name,
                "email": member.email,
                "age": member.age,
                "city": member.city,
                "state": member.state,
                "language": member.language,
                "occupation": member.occupation,
            }
            for member in members
        ],
    }


def get_segment_members(
    db: Session,
    filter_rules: dict,
    skip: int = 0,
    limit: int = 10,
):
    """Return paginated audience members matching a segment."""
    if skip < 0:
        raise ValueError("Skip cannot be negative.")

    if not 1 <= limit <= 100:
        raise ValueError("Limit must be between 1 and 100.")

    query = build_segment_query(db, filter_rules)
    total = query.count()
    members = (
        query.order_by(AudienceMember.id.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return {"total": total, "items": members}
