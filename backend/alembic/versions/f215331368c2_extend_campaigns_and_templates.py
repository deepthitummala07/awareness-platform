
"""extend campaigns and templates

Revision ID: f215331368c2
Revises: e7ee0cbf5ed5
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision: str = "f215331368c2"
down_revision: Union[str, Sequence[str], None] = "e7ee0cbf5ed5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()

    # Add only missing columns because an earlier attempt
    # may have partially applied this migration.
    additions = {
        "campaigns": [
            sa.Column(
                "campaign_type",
                sa.String(50),
                nullable=False,
                server_default="Awareness",
            ),
            sa.Column("objective", sa.Text(), nullable=True),
            sa.Column("target_segments", sa.JSON(), nullable=True),
            sa.Column("channels", sa.JSON(), nullable=True),
            sa.Column(
                "start_date",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
            sa.Column(
                "end_date",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
            sa.Column(
                "priority",
                sa.String(20),
                nullable=False,
                server_default="Normal",
            ),
            # Nullable so SQLite can add this column safely
            # to a table that already contains records.
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
        ],
        "templates": [
            sa.Column("title", sa.String(150), nullable=True),
            sa.Column(
                "category",
                sa.String(50),
                nullable=False,
                server_default="General",
            ),
            sa.Column("tags", sa.JSON(), nullable=True),
        ],
    }

    for table_name, columns in additions.items():
        existing = {
            column["name"]
            for column in inspect(connection).get_columns(table_name)
        }

        for column in columns:
            if column.name not in existing:
                op.add_column(table_name, column)
                existing.add(column.name)


def downgrade() -> None:
    # Remove only columns introduced by this migration.
    connection = op.get_bind()

    removals = {
        "templates": ["tags", "category", "title"],
        "campaigns": [
            "updated_at",
            "priority",
            "end_date",
            "start_date",
            "channels",
            "target_segments",
            "objective",
            "campaign_type",
        ],
    }

    for table_name, column_names in removals.items():
        existing = {
            column["name"]
            for column in inspect(connection).get_columns(table_name)
        }

        for column_name in column_names:
            if column_name in existing:
                op.drop_column(table_name, column_name)
