"""Database models for the Family Gifting Dashboard API."""

from app.models.base import BaseModel, TimestampMixin
from app.models.comment import Comment, CommentParentType
from app.models.entity_budget import EntityBudget
from app.models.gift import Gift
from app.models.list import List, ListType, ListVisibility
from app.models.list_item import ListItem, ListItemStatus
from app.models.occasion import Occasion, OccasionType
from app.models.person import Person
from app.models.tag import Tag, gift_tags
from app.models.user import User

__all__ = [
    # Base
    "BaseModel",
    "TimestampMixin",
    # Core entities
    "User",
    "Person",
    "Occasion",
    "List",
    "Gift",
    # Junction/dependent entities
    "ListItem",
    "Tag",
    "Comment",
    "EntityBudget",
    # Association tables
    "gift_tags",
    # Enums
    "OccasionType",
    "ListType",
    "ListVisibility",
    "ListItemStatus",
    "CommentParentType",
]
