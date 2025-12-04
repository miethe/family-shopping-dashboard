"""Repository layer for database operations.

This module provides the repository layer of the application, following
the Repository Pattern to abstract database operations from business logic.

Architecture:
    Router → Service → Repository → Database

Key Rules:
    - Repositories return ORM models ONLY (never DTOs)
    - No business logic in repositories (only DB operations)
    - Service layer converts ORM → DTO

Components:
    - BaseRepository: Generic CRUD with cursor-based pagination
    - Entity repositories: Domain-specific query methods
"""

from app.repositories.base import BaseRepository
from app.repositories.budget import BudgetRepository
from app.repositories.comment import CommentRepository
from app.repositories.gift import GiftRepository
from app.repositories.list import ListRepository
from app.repositories.list_item import ListItemRepository
from app.repositories.occasion import OccasionRepository
from app.repositories.person import PersonRepository
from app.repositories.tag import TagRepository
from app.repositories.user import UserRepository

__all__ = [
    # Base
    "BaseRepository",
    # Entity repositories
    "UserRepository",
    "PersonRepository",
    "OccasionRepository",
    "ListRepository",
    "GiftRepository",
    "ListItemRepository",
    "TagRepository",
    "CommentRepository",
    "BudgetRepository",
]
