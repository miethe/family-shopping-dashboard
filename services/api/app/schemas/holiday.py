"""Holiday catalog DTOs."""
from datetime import date
from pydantic import BaseModel, Field, model_validator


class HolidayCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    key: str = Field(min_length=1, max_length=100, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    is_major: bool = False
    theme_key: str | None = Field(default=None, max_length=100)
    theme_window_days: int = Field(default=30, ge=0, le=366)

    @model_validator(mode="after")
    def valid_date(self):
        date(2000, self.month, self.day)
        return self


class HolidayEdit(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    month: int = Field(ge=1, le=12)
    day: int = Field(ge=1, le=31)
    is_major: bool = False
    theme_key: str | None = Field(default=None, max_length=100)
    theme_window_days: int = Field(default=30, ge=0, le=366)

    @model_validator(mode="after")
    def valid_date(self):
        date(2000, self.month, self.day)
        return self


class HolidayResponse(HolidayCreate):
    id: int
    next_date: date
    days_until: int


class ActiveTheme(BaseModel):
    theme_key: str | None = None
