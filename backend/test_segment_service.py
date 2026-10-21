
from app.core.database import SessionLocal
from app.services.segment_service import preview_segment

db = SessionLocal()

try:
    rules = {
        "combination": "AND",
        "rules": [
            {
                "field": "language",
                "operator": "equals",
                "value": "Telugu",
            },
            {
                "field": "city",
                "operator": "contains",
                "value": "Hyderabad",
            },
        ],
    }

    result = preview_segment(db, rules)

    print("Matching audience count:", result["total"])
    print("Sample members:")

    for member in result["sample"]:
        print(member)

finally:
    db.close()
