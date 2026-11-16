"""Authenticated, surface-independent event gifting endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.schemas.gifting import (
    Allowance,
    CaptureCreate,
    GiftCard,
    OccurrenceCreate,
    OccurrenceUpdate,
    OccurrenceView,
    PersonView,
    PlacementCreate,
    PlacementUpdate,
    YearRollup,
)
from app.services.gifting import GiftingService

router = APIRouter(prefix="/gifting", tags=["gifting"], dependencies=[Depends(get_current_user)])


def service(session: AsyncSession = Depends(get_db)):
    return GiftingService(session)


@router.get("/occurrences", response_model=list[OccurrenceView])
async def occurrences(svc=Depends(service), user=Depends(get_current_user)):
    return await svc.occurrences(user)


@router.post("/occurrences", response_model=OccurrenceView, status_code=201)
async def create(data: OccurrenceCreate, svc=Depends(service), user=Depends(get_current_user)):
    return await svc.create(data, user)


@router.get("/occurrences/{identifier}", response_model=OccurrenceView)
async def occurrence(identifier: int, svc=Depends(service), user=Depends(get_current_user)):
    return await svc.occurrence(identifier, user)


@router.patch("/occurrences/{identifier}", response_model=OccurrenceView)
async def close(
    identifier: int, data: OccurrenceUpdate, svc=Depends(service), user=Depends(get_current_user)
):
    return await svc.close(identifier, data, user)


@router.put("/occurrences/{identifier}/people/{person_id}", response_model=OccurrenceView)
async def allowance(
    identifier: int,
    person_id: int,
    data: Allowance,
    svc=Depends(service),
    user=Depends(get_current_user),
):
    return await svc.allowance(identifier, person_id, data, user)


@router.post("/envelopes/{identifier}/gifts", response_model=GiftCard, status_code=201)
async def place(
    identifier: int, data: PlacementCreate, svc=Depends(service), user=Depends(get_current_user)
):
    return await svc.place(identifier, data, user)


@router.patch("/gifts/{identifier}")
async def phase(
    identifier: int, data: PlacementUpdate, svc=Depends(service), user=Depends(get_current_user)
):
    return await svc.phase(identifier, data, user)


@router.post("/ideas", response_model=GiftCard, status_code=201)
async def capture(data: CaptureCreate, svc=Depends(service), user=Depends(get_current_user)):
    return await svc.capture(data, user)


@router.get("/ideas", response_model=list[GiftCard])
async def ideas(svc=Depends(service), user=Depends(get_current_user)):
    return await svc.ideas(user)


@router.get("/people/{identifier}", response_model=PersonView)
async def person(identifier: int, svc=Depends(service), user=Depends(get_current_user)):
    return await svc.person(identifier, user)


@router.get("/budgets", response_model=YearRollup)
async def budgets(
    year: int = Query(ge=1900, le=9999), svc=Depends(service), user=Depends(get_current_user)
):
    return await svc.rollup(year, user)
