"""Comment API routes with visibility and author-only mutations."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import ForbiddenError
from app.models.comment import CommentParentType
from app.schemas.comment import CommentCreate, CommentResponse, CommentUpdate
from app.services.comment import CommentService

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get(
    "",
    response_model=list[CommentResponse],
    status_code=status.HTTP_200_OK,
    summary="List comments for an entity",
    description="Returns public comments plus the current user's private comments for a given entity.",
)
async def list_comments(
    parent_type: CommentParentType = Query(..., alias="entity_type"),
    parent_id: int = Query(..., alias="entity_id"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CommentResponse]:
    service = CommentService(db)
    return await service.get_for_parent(
        parent_type=parent_type,
        parent_id=parent_id,
        viewer_id=current_user_id,
    )


@router.post(
    "",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a comment",
    description="Create a new comment with optional private visibility.",
)
async def create_comment(
    data: CommentCreate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommentResponse:
    service = CommentService(db)
    return await service.create(author_id=current_user_id, data=data)


@router.patch(
    "/{comment_id}",
    response_model=CommentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a comment",
    description="Update comment content or visibility (author-only).",
)
async def update_comment(
    comment_id: int,
    data: CommentUpdate,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommentResponse:
    service = CommentService(db)
    try:
        updated = await service.update(
            comment_id=comment_id, data=data, current_user_id=current_user_id
        )
    except ForbiddenError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )

    return updated


@router.delete(
    "/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a comment",
    description="Delete a comment (author-only).",
)
async def delete_comment(
    comment_id: int,
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = CommentService(db)
    try:
        deleted = await service.delete(comment_id=comment_id, current_user_id=current_user_id)
    except ForbiddenError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found",
        )

    return None
