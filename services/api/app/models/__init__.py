"""Database models for the Family Gifting Dashboard API."""

from app.models.base import BaseModel, TimestampMixin
from app.models.comment import Comment, CommentParentType
from app.models.entity_budget import EntityBudget
from app.models.gift import Gift, GiftPriority
from app.models.gift_person import GiftPerson, GiftPersonRole
from app.models.group import Group, PersonGroup
from app.models.list import List, ListType, ListVisibility
from app.models.list_item import ListItem, ListItemStatus
from app.models.occasion import Occasion, OccasionType
from app.models.person import Person, PersonOccasion
from app.models.store import GiftStore, Store
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
    "Store",
    "Group",
    # Junction/dependent entities
    "ListItem",
    "Tag",
    "Comment",
    "EntityBudget",
    "PersonOccasion",
    "GiftPerson",
    "GiftPersonRole",
    "PersonGroup",
    # Association tables
    "gift_tags",
    "GiftStore",
    # Enums
    "OccasionType",
    "ListType",
    "ListVisibility",
    "ListItemStatus",
    "CommentParentType",
    "GiftPriority",
]
