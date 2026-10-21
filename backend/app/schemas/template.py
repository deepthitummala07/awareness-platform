
from pydantic import BaseModel, ConfigDict, Field


class TemplateBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    title: str | None = Field(default=None, max_length=150)
    category: str = "General"
    language: str = "English"
    channel: str = "SMS"
    content: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)


class TemplateCreate(TemplateBase):
    pass


class TemplateUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    title: str | None = Field(default=None, max_length=150)
    category: str | None = None
    language: str | None = None
    channel: str | None = None
    content: str | None = Field(default=None, min_length=1)
    tags: list[str] | None = None


class TemplateResponse(TemplateBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class TemplatePreviewRequest(BaseModel):
    content: str = Field(min_length=1)
    sample_data: dict[str, str] = Field(
        default_factory=lambda: {
            "name": "Ravi",
            "area": "Hyderabad",
        }
    )


class TemplatePreviewResponse(BaseModel):
    original_content: str
    preview_content: str
    placeholders: list[str]
