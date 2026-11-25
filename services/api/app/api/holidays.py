"""Authenticated holiday catalog and active theme endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.holiday import ActiveTheme, HolidayCreate, HolidayEdit, HolidayResponse
from app.services.holiday import HolidayService

router = APIRouter(prefix="/holidays", tags=["holidays"])


@router.get("", response_model=list[HolidayResponse])
async def list_holidays(user_id: int = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    return await HolidayService(session).list()


@router.get("/active-theme", response_model=ActiveTheme)
async def theme(user_id: int = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    return ActiveTheme(theme_key=await HolidayService(session).active_theme())


@router.post("", response_model=HolidayResponse, status_code=201)
async def create_holiday(data: HolidayCreate, user_id: int = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    return await HolidayService(session).create(data)


@router.put("/{holiday_id}", response_model=HolidayResponse)
async def edit_holiday(holiday_id: int, data: HolidayEdit, user_id: int = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    row = await HolidayService(session).edit(holiday_id, data)
    if row is None:
        raise NotFoundError(message="Holiday not found")
    return row
