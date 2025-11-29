#!/usr/bin/env python3
"""
Test Data Population Script for Family Gifting Dashboard
==========================================================

This script resets the database using reset_dev_db.py and populates it with
comprehensive test data for development, testing, and demos.

What it creates:
  - 3 Users (Alice, Bob, Carol - family members)
  - 5 People (Grandma Betty, Uncle Tom, Cousin Emma, Friend Sarah, Nephew Jake)
  - 5 Occasions (Christmas 2024, Grandma's Birthday, Mother's Day, Anniversary, Emma's Birthday)
  - 10 Tags (Books, Electronics, Clothing, Home & Garden, etc.)
  - 20+ Gifts (diverse items with prices, URLs, images)
  - 8 Lists (various types: wishlist, ideas, assigned)
  - 25+ ListItems (gifts added to lists with different statuses)
  - 10+ Comments (on various entities)

How to run:
  IMPORTANT: This script MUST be run from the services/api/ directory

  With uv (recommended):
    $ cd services/api
    $ uv run python scripts/populate_test_data.py

  Basic usage (clears DB and populates):
    $ cd services/api
    $ python scripts/populate_test_data.py

  Skip confirmation prompt:
    $ cd services/api
    $ python scripts/populate_test_data.py --yes

Options:
  --yes, -y     Skip confirmation prompt and proceed with data population
  --help, -h    Show this help message

Environment variables required:
  DATABASE_URL  PostgreSQL connection string (async format)
  JWT_SECRET_KEY  Secret key for JWT tokens

⚠️  WARNING: This script will DROP ALL TABLES and recreate them.
            All existing data will be PERMANENTLY DELETED.
            Only use this in development environments!

Note: This script uses reset_dev_db.py which handles database reset via Alembic migrations.
      The alembic.ini file must exist in the current directory (services/api/).
"""

import asyncio
import subprocess
import sys
from datetime import date, datetime, timezone
from decimal import Decimal
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_maker
from app.models.comment import Comment, CommentParentType
from app.models.gift import Gift
from app.models.list import List, ListType, ListVisibility
from app.models.list_item import ListItem, ListItemStatus
from app.models.occasion import Occasion, OccasionType
from app.models.person import Person
from app.models.tag import Tag
from app.models.user import User
from app.services.auth import AuthService


class TestDataPopulator:
    """
    Test data population orchestrator.

    Handles database cleanup, data creation in dependency order,
    and progress reporting.
    """

    def __init__(self):
        """Initialize the populator with an auth service."""
        self.auth_service = AuthService()
        self.users = {}
        self.people = {}
        self.occasions = {}
        self.tags = {}
        self.gifts = {}
        self.lists = {}

    async def reset_database(self) -> None:
        """
        Reset the database using the reset_dev_db.py script.
        This drops all tables, enums, and runs Alembic migrations.
        """
        print("\n🔄 Resetting database using reset_dev_db.py...")

        # Get path to reset_dev_db.py
        script_dir = Path(__file__).parent
        reset_script = script_dir / "reset_dev_db.py"

        try:
            # Run reset_dev_db.py with --yes flag to skip confirmation
            result = subprocess.run(
                ["uv", "run", "python", str(reset_script), "--yes"],
                capture_output=True,
                text=True,
                check=True,
                cwd=script_dir.parent,  # Run from services/api directory
            )

            print(result.stdout)
            print("✅ Database reset completed successfully")

        except subprocess.CalledProcessError as e:
            print("\n❌ ERROR: Database reset failed")
            print(f"Exit code: {e.returncode}")
            if e.stdout:
                print("\nStdout:")
                print(e.stdout)
            if e.stderr:
                print("\nStderr:")
                print(e.stderr)
            raise
        except FileNotFoundError:
            print("\n❌ ERROR: reset_dev_db.py not found")
            print(f"Expected at: {reset_script}")
            raise

    async def create_users(self, session: AsyncSession) -> None:
        """
        Create 3 family member users.

        Users:
          - Alice (alice@family.test) - Mom
          - Bob (bob@family.test) - Dad
          - Carol (carol@family.test) - Daughter

        All users have password: testpass1
        """
        print("\n👤 Creating users...")

        users_data = [
            {"email": "alice@family.test", "password": "testpass1", "name": "Alice"},
            {"email": "bob@family.test", "password": "testpass1", "name": "Bob"},
            {"email": "carol@family.test", "password": "testpass1", "name": "Carol"},
        ]

        for user_data in users_data:
            password_hash = self.auth_service.hash_password(user_data["password"])
            user = User(
                email=user_data["email"],
                password_hash=password_hash,
            )
            session.add(user)
            await session.flush()  # Get ID without committing
            self.users[user_data["name"]] = user
            print(f"  ✓ Created user: {user_data['name']} ({user_data['email']})")

        await session.commit()
        print(f"✅ Created {len(users_data)} users")

    async def create_people(self, session: AsyncSession) -> None:
        """
        Create 5 gift recipient people.

        People:
          - Grandma Betty (Grandmother, interests: gardening, knitting, baking)
          - Uncle Tom (Uncle, interests: golf, cooking, wine)
          - Cousin Emma (Cousin, interests: art, music, reading)
          - Friend Sarah (Friend, interests: yoga, travel, photography)
          - Nephew Jake (Nephew, interests: video games, dinosaurs, soccer)
        """
        print("\n👨‍👩‍👧‍👦 Creating people...")

        people_data = [
            {
                "name": "Grandma Betty",
                "display_name": "Grandma Betty",
                "relationship": "Grandmother",
                "birthdate": date(1950, 5, 15),
                "interests": ["gardening", "knitting", "baking"],
                "sizes": {"clothing": "M", "shoe": "7"},
                "notes": "Loves homemade gifts and gardening supplies",
            },
            {
                "name": "Uncle Tom",
                "display_name": "Uncle Tom",
                "relationship": "Uncle",
                "birthdate": date(1965, 8, 22),
                "interests": ["golf", "cooking", "wine"],
                "constraints": "Prefers eco-friendly products",
                "notes": "Avid golfer, enjoys fine wine",
            },
            {
                "name": "Cousin Emma",
                "display_name": "Cousin Emma",
                "relationship": "Cousin",
                "birthdate": date(2010, 3, 10),
                "interests": ["art", "music", "reading"],
                "sizes": {"clothing": "S", "shoe": "6"},
                "notes": "Creative and artistic, loves books",
            },
            {
                "name": "Friend Sarah",
                "display_name": "Sarah",
                "relationship": "Friend",
                "birthdate": None,
                "interests": ["yoga", "travel", "photography"],
                "notes": "Health-conscious, loves experiences over things",
            },
            {
                "name": "Nephew Jake",
                "display_name": "Jake",
                "relationship": "Nephew",
                "birthdate": date(2015, 11, 30),
                "interests": ["video games", "dinosaurs", "soccer"],
                "sizes": {"clothing": "YM"},
                "notes": "Energetic 9-year-old, obsessed with dinosaurs",
            },
        ]

        for person_data in people_data:
            person = Person(
                display_name=person_data["display_name"],
                relationship=person_data["relationship"],
                birthdate=person_data.get("birthdate"),
                interests=person_data.get("interests"),
                sizes=person_data.get("sizes"),
                constraints=person_data.get("constraints"),
                notes=person_data.get("notes"),
            )
            session.add(person)
            await session.flush()
            self.people[person_data["name"]] = person
            print(f"  ✓ Created person: {person_data['display_name']} ({person_data['relationship']})")

        await session.commit()
        print(f"✅ Created {len(people_data)} people")

    async def create_occasions(self, session: AsyncSession) -> None:
        """
        Create 5 gifting occasions.

        Occasions are created with dates relative to today to ensure they're always
        in the future for testing the dashboard primary_occasion feature.

        Occasions:
          - Tomorrow's Birthday (birthday) - 1 day from now
          - Next Week Holiday (holiday) - 7 days from now
          - Grandma's Birthday (birthday) - 30 days from now
          - Anniversary (other) - 60 days from now
          - Mother's Day (holiday) - 90 days from now
        """
        print("\n🎉 Creating occasions...")

        today = date.today()

        occasions_data = [
            {
                "name": "Tomorrow's Birthday",
                "type": OccasionType.birthday,
                "date": date.fromordinal(today.toordinal() + 1),
                "description": "Test birthday happening tomorrow",
            },
            {
                "name": "Next Week Holiday",
                "type": OccasionType.holiday,
                "date": date.fromordinal(today.toordinal() + 7),
                "description": "Test holiday next week",
            },
            {
                "name": "Grandma's 75th Birthday",
                "type": OccasionType.birthday,
                "date": date.fromordinal(today.toordinal() + 30),
                "description": "Milestone birthday party",
            },
            {
                "name": "Anniversary",
                "type": OccasionType.other,
                "date": date.fromordinal(today.toordinal() + 60),
                "description": "Alice & Bob's anniversary",
            },
            {
                "name": "Mother's Day",
                "type": OccasionType.holiday,
                "date": date.fromordinal(today.toordinal() + 90),
                "description": "Mother's Day celebration",
            },
        ]

        for occasion_data in occasions_data:
            occasion = Occasion(
                name=occasion_data["name"],
                type=occasion_data["type"],
                date=occasion_data["date"],
                description=occasion_data.get("description"),
            )
            session.add(occasion)
            await session.flush()
            self.occasions[occasion_data["name"]] = occasion
            print(f"  ✓ Created occasion: {occasion_data['name']} ({occasion_data['type'].value})")

        await session.commit()
        print(f"✅ Created {len(occasions_data)} occasions")

    async def create_tags(self, session: AsyncSession) -> None:
        """
        Create 10 tag categories.

        Tags:
          Books, Electronics, Clothing, Home & Garden, Experiences,
          Hobbies, Toys & Games, Food & Drink, Jewelry, Sports & Outdoors
        """
        print("\n🏷️  Creating tags...")

        tags_data = [
            {"name": "Books", "description": "Books and reading materials"},
            {"name": "Electronics", "description": "Electronic devices and gadgets"},
            {"name": "Clothing", "description": "Clothing and apparel"},
            {"name": "Home & Garden", "description": "Home and garden items"},
            {"name": "Experiences", "description": "Experiences and activities"},
            {"name": "Hobbies", "description": "Hobby supplies and equipment"},
            {"name": "Toys & Games", "description": "Toys, games, and entertainment"},
            {"name": "Food & Drink", "description": "Food, beverages, and culinary items"},
            {"name": "Jewelry", "description": "Jewelry and accessories"},
            {"name": "Sports & Outdoors", "description": "Sports and outdoor equipment"},
        ]

        for tag_data in tags_data:
            tag = Tag(
                name=tag_data["name"],
                description=tag_data.get("description"),
            )
            session.add(tag)
            await session.flush()
            self.tags[tag_data["name"]] = tag
            print(f"  ✓ Created tag: {tag_data['name']}")

        await session.commit()
        print(f"✅ Created {len(tags_data)} tags")

    async def create_gifts(self, session: AsyncSession) -> None:
        """
        Create 20+ diverse gift items.

        Gifts include:
          - Various price ranges ($10-$500)
          - Mix of items with/without URLs
          - Different categories via tags
          - Some with image URLs
        """
        print("\n🎁 Creating gifts...")

        gifts_data = [
            {
                "name": "Gardening Tool Set",
                "price": Decimal("45.99"),
                "url": "https://example.com/garden-tools",
                "image_url": "https://example.com/images/garden-tools.jpg",
                "source": "Amazon",
                "tags": ["Home & Garden", "Hobbies"],
            },
            {
                "name": "Kindle Paperwhite",
                "price": Decimal("139.99"),
                "url": "https://example.com/kindle",
                "image_url": "https://example.com/images/kindle.jpg",
                "source": "Amazon",
                "tags": ["Electronics", "Books"],
            },
            {
                "name": "Yoga Mat Premium",
                "price": Decimal("59.99"),
                "url": "https://example.com/yoga-mat",
                "tags": ["Sports & Outdoors", "Hobbies"],
            },
            {
                "name": "Cooking Class Gift Certificate",
                "price": Decimal("150.00"),
                "url": None,
                "tags": ["Experiences", "Food & Drink"],
            },
            {
                "name": "Art Supply Kit",
                "price": Decimal("34.99"),
                "url": "https://example.com/art-supplies",
                "image_url": "https://example.com/images/art-kit.jpg",
                "tags": ["Hobbies"],
            },
            {
                "name": "LEGO Dinosaur Set",
                "price": Decimal("79.99"),
                "url": "https://example.com/lego-dino",
                "image_url": "https://example.com/images/lego.jpg",
                "tags": ["Toys & Games"],
            },
            {
                "name": "Cozy Winter Sweater",
                "price": Decimal("68.00"),
                "url": "https://example.com/sweater",
                "tags": ["Clothing"],
            },
            {
                "name": "Golf Club Set",
                "price": Decimal("499.99"),
                "url": "https://example.com/golf-clubs",
                "image_url": "https://example.com/images/golf.jpg",
                "tags": ["Sports & Outdoors", "Hobbies"],
            },
            {
                "name": "Organic Wine Selection Box",
                "price": Decimal("89.99"),
                "url": "https://example.com/wine-box",
                "tags": ["Food & Drink"],
            },
            {
                "name": "Pearl Necklace",
                "price": Decimal("245.00"),
                "url": "https://example.com/pearl-necklace",
                "image_url": "https://example.com/images/pearls.jpg",
                "tags": ["Jewelry"],
            },
            {
                "name": "Photography Workshop Pass",
                "price": Decimal("125.00"),
                "url": None,
                "tags": ["Experiences", "Hobbies"],
            },
            {
                "name": "Knitting Yarn Bundle",
                "price": Decimal("42.50"),
                "url": "https://example.com/yarn",
                "tags": ["Hobbies"],
            },
            {
                "name": "Smart Watch",
                "price": Decimal("299.99"),
                "url": "https://example.com/smartwatch",
                "image_url": "https://example.com/images/watch.jpg",
                "tags": ["Electronics", "Sports & Outdoors"],
            },
            {
                "name": "Children's Book Collection",
                "price": Decimal("28.99"),
                "url": "https://example.com/books-kids",
                "tags": ["Books", "Toys & Games"],
            },
            {
                "name": "Soccer Ball and Gear",
                "price": Decimal("45.00"),
                "url": "https://example.com/soccer",
                "tags": ["Sports & Outdoors"],
            },
            {
                "name": "Baking Cookbook",
                "price": Decimal("19.99"),
                "url": "https://example.com/baking-book",
                "tags": ["Books", "Food & Drink"],
            },
            {
                "name": "Travel Backpack",
                "price": Decimal("89.99"),
                "url": "https://example.com/backpack",
                "image_url": "https://example.com/images/backpack.jpg",
                "tags": ["Sports & Outdoors"],
            },
            {
                "name": "Wireless Headphones",
                "price": Decimal("149.99"),
                "url": "https://example.com/headphones",
                "image_url": "https://example.com/images/headphones.jpg",
                "tags": ["Electronics"],
            },
            {
                "name": "Dinosaur Encyclopedia",
                "price": Decimal("22.99"),
                "url": "https://example.com/dino-book",
                "tags": ["Books"],
            },
            {
                "name": "Indoor Herb Garden Kit",
                "price": Decimal("34.99"),
                "url": "https://example.com/herb-kit",
                "tags": ["Home & Garden", "Hobbies"],
            },
            {
                "name": "Yoga and Meditation Retreat",
                "price": Decimal("450.00"),
                "url": None,
                "tags": ["Experiences", "Sports & Outdoors"],
            },
            {
                "name": "Musical Keyboard for Kids",
                "price": Decimal("129.99"),
                "url": "https://example.com/keyboard",
                "tags": ["Toys & Games", "Hobbies"],
            },
        ]

        for gift_data in gifts_data:
            gift = Gift(
                name=gift_data["name"],
                price=gift_data.get("price"),
                url=gift_data.get("url"),
                image_url=gift_data.get("image_url"),
                source=gift_data.get("source"),
            )

            # Add tags
            for tag_name in gift_data.get("tags", []):
                if tag_name in self.tags:
                    gift.tags.append(self.tags[tag_name])

            session.add(gift)
            await session.flush()
            self.gifts[gift_data["name"]] = gift
            price_str = f"${gift_data['price']}" if gift_data.get("price") else "No price"
            print(f"  ✓ Created gift: {gift_data['name']} ({price_str})")

        await session.commit()
        print(f"✅ Created {len(gifts_data)} gifts")

    async def create_lists(self, session: AsyncSession) -> None:
        """
        Create 8 diverse gift lists.

        Lists:
          - Alice's wishlist for Grandma (Christmas 2024)
          - Bob's ideas for Uncle Tom (Anniversary)
          - Carol's wishlist for Emma (Emma's Birthday)
          - Alice's assigned list (Mother's Day)
          - Bob's ideas for Jake (Christmas 2024)
          - Carol's personal wishlist
          - Alice's general ideas
          - Bob's Christmas planning
        """
        print("\n📋 Creating lists...")

        lists_data = [
            {
                "name": "Gift Ideas for Grandma",
                "type": ListType.wishlist,
                "visibility": ListVisibility.family,
                "user": "Alice",
                "person": "Grandma Betty",
                "occasion": "Grandma's 75th Birthday",
            },
            {
                "name": "Uncle Tom Anniversary Ideas",
                "type": ListType.ideas,
                "visibility": ListVisibility.private,
                "user": "Bob",
                "person": "Uncle Tom",
                "occasion": "Anniversary",
            },
            {
                "name": "Emma's Birthday Wishlist",
                "type": ListType.wishlist,
                "visibility": ListVisibility.family,
                "user": "Carol",
                "person": "Cousin Emma",
                "occasion": "Tomorrow's Birthday",
            },
            {
                "name": "Mother's Day - Assigned",
                "type": ListType.assigned,
                "visibility": ListVisibility.family,
                "user": "Alice",
                "person": None,
                "occasion": "Mother's Day",
            },
            {
                "name": "Jake's Christmas List",
                "type": ListType.ideas,
                "visibility": ListVisibility.family,
                "user": "Bob",
                "person": "Nephew Jake",
                "occasion": "Next Week Holiday",
            },
            {
                "name": "Carol's Personal Wishlist",
                "type": ListType.wishlist,
                "visibility": ListVisibility.private,
                "user": "Carol",
                "person": None,
                "occasion": None,
            },
            {
                "name": "General Gift Ideas",
                "type": ListType.ideas,
                "visibility": ListVisibility.family,
                "user": "Alice",
                "person": None,
                "occasion": None,
            },
            {
                "name": "Next Week Planning",
                "type": ListType.ideas,
                "visibility": ListVisibility.public,
                "user": "Bob",
                "person": None,
                "occasion": "Next Week Holiday",
            },
        ]

        for list_data in lists_data:
            gift_list = List(
                name=list_data["name"],
                type=list_data["type"],
                visibility=list_data["visibility"],
                user_id=self.users[list_data["user"]].id,
                person_id=self.people[list_data["person"]].id if list_data.get("person") else None,
                occasion_id=self.occasions[list_data["occasion"]].id if list_data.get("occasion") else None,
            )
            session.add(gift_list)
            await session.flush()
            self.lists[list_data["name"]] = gift_list
            print(f"  ✓ Created list: {list_data['name']} ({list_data['type'].value})")

        await session.commit()
        print(f"✅ Created {len(lists_data)} lists")

    async def create_list_items(self, session: AsyncSession) -> None:
        """
        Create 25+ list items (gifts added to lists).

        List items have various statuses:
          - idea: Initial idea
          - selected: Selected for purchase
          - purchased: Already purchased
          - received: Gift received

        Some items are assigned to specific users.
        """
        print("\n📝 Creating list items...")

        list_items_data = [
            # Alice's wishlist for Grandma (Christmas 2024)
            {
                "list": "Gift Ideas for Grandma",
                "gift": "Gardening Tool Set",
                "status": ListItemStatus.selected,
                "assigned_to": "Alice",
                "notes": "Perfect for her spring garden",
            },
            {
                "list": "Gift Ideas for Grandma",
                "gift": "Knitting Yarn Bundle",
                "status": ListItemStatus.purchased,
                "assigned_to": "Bob",
                "notes": "She mentioned wanting to knit scarves",
            },
            {
                "list": "Gift Ideas for Grandma",
                "gift": "Baking Cookbook",
                "status": ListItemStatus.idea,
                "notes": "She loves trying new recipes",
            },
            {
                "list": "Gift Ideas for Grandma",
                "gift": "Indoor Herb Garden Kit",
                "status": ListItemStatus.selected,
                "assigned_to": "Carol",
            },
            # Bob's ideas for Uncle Tom (Anniversary)
            {
                "list": "Uncle Tom Anniversary Ideas",
                "gift": "Golf Club Set",
                "status": ListItemStatus.idea,
                "notes": "Might be too expensive, need to check budget",
            },
            {
                "list": "Uncle Tom Anniversary Ideas",
                "gift": "Organic Wine Selection Box",
                "status": ListItemStatus.selected,
                "assigned_to": "Bob",
                "notes": "Eco-friendly wine selection",
            },
            {
                "list": "Uncle Tom Anniversary Ideas",
                "gift": "Cooking Class Gift Certificate",
                "status": ListItemStatus.idea,
                "notes": "He mentioned wanting to learn French cooking",
            },
            # Emma's Birthday Wishlist
            {
                "list": "Emma's Birthday Wishlist",
                "gift": "Art Supply Kit",
                "status": ListItemStatus.purchased,
                "assigned_to": "Alice",
                "notes": "Got the deluxe version",
            },
            {
                "list": "Emma's Birthday Wishlist",
                "gift": "Children's Book Collection",
                "status": ListItemStatus.selected,
                "assigned_to": "Carol",
            },
            {
                "list": "Emma's Birthday Wishlist",
                "gift": "Musical Keyboard for Kids",
                "status": ListItemStatus.idea,
                "notes": "She's been interested in music",
            },
            {
                "list": "Emma's Birthday Wishlist",
                "gift": "Kindle Paperwhite",
                "status": ListItemStatus.idea,
            },
            # Mother's Day - Assigned
            {
                "list": "Mother's Day - Assigned",
                "gift": "Pearl Necklace",
                "status": ListItemStatus.selected,
                "assigned_to": "Bob",
                "notes": "For grandma",
            },
            {
                "list": "Mother's Day - Assigned",
                "gift": "Photography Workshop Pass",
                "status": ListItemStatus.purchased,
                "assigned_to": "Carol",
                "notes": "For Sarah",
            },
            # Jake's Christmas List
            {
                "list": "Jake's Christmas List",
                "gift": "LEGO Dinosaur Set",
                "status": ListItemStatus.purchased,
                "assigned_to": "Alice",
                "notes": "He's obsessed with dinosaurs!",
            },
            {
                "list": "Jake's Christmas List",
                "gift": "Soccer Ball and Gear",
                "status": ListItemStatus.selected,
                "assigned_to": "Bob",
            },
            {
                "list": "Jake's Christmas List",
                "gift": "Dinosaur Encyclopedia",
                "status": ListItemStatus.idea,
            },
            {
                "list": "Jake's Christmas List",
                "gift": "Smart Watch",
                "status": ListItemStatus.idea,
                "notes": "Maybe too expensive for a 9-year-old?",
            },
            # Carol's Personal Wishlist
            {
                "list": "Carol's Personal Wishlist",
                "gift": "Wireless Headphones",
                "status": ListItemStatus.idea,
                "notes": "For music and podcasts",
            },
            {
                "list": "Carol's Personal Wishlist",
                "gift": "Travel Backpack",
                "status": ListItemStatus.selected,
            },
            {
                "list": "Carol's Personal Wishlist",
                "gift": "Yoga Mat Premium",
                "status": ListItemStatus.idea,
            },
            # General Gift Ideas
            {
                "list": "General Gift Ideas",
                "gift": "Cozy Winter Sweater",
                "status": ListItemStatus.idea,
                "notes": "Good for anyone",
            },
            {
                "list": "General Gift Ideas",
                "gift": "Indoor Herb Garden Kit",
                "status": ListItemStatus.idea,
            },
            {
                "list": "General Gift Ideas",
                "gift": "Yoga and Meditation Retreat",
                "status": ListItemStatus.idea,
                "notes": "Experience gift - Sarah would love this",
            },
            # Next Week Planning
            {
                "list": "Next Week Planning",
                "gift": "Gardening Tool Set",
                "status": ListItemStatus.selected,
                "assigned_to": "Alice",
            },
            {
                "list": "Next Week Planning",
                "gift": "LEGO Dinosaur Set",
                "status": ListItemStatus.purchased,
                "assigned_to": "Alice",
            },
            {
                "list": "Next Week Planning",
                "gift": "Knitting Yarn Bundle",
                "status": ListItemStatus.purchased,
                "assigned_to": "Bob",
            },
        ]

        for item_data in list_items_data:
            list_item = ListItem(
                gift_id=self.gifts[item_data["gift"]].id,
                list_id=self.lists[item_data["list"]].id,
                status=item_data["status"],
                assigned_to=self.users[item_data["assigned_to"]].id if item_data.get("assigned_to") else None,
                notes=item_data.get("notes"),
            )
            session.add(list_item)
            status_str = item_data["status"].value
            print(f"  ✓ Added to '{item_data['list']}': {item_data['gift']} ({status_str})")

        await session.commit()
        print(f"✅ Created {len(list_items_data)} list items")

    async def create_comments(self, session: AsyncSession) -> None:
        """
        Create 10+ comments on various entities.

        Comments are added to:
          - list_items
          - lists
          - occasions
          - persons
        """
        print("\n💬 Creating comments...")

        # We need to get list_item IDs for comments
        # For simplicity, we'll just grab the first few list items
        result = await session.execute(text("SELECT id FROM list_items LIMIT 5"))
        list_item_ids = [row[0] for row in result.fetchall()]

        result = await session.execute(text("SELECT id FROM lists LIMIT 3"))
        list_ids = [row[0] for row in result.fetchall()]

        comments_data = [
            # Comments on list items
            {
                "content": "Great idea! She mentioned wanting this.",
                "author": "Bob",
                "parent_type": CommentParentType.list_item,
                "parent_id": list_item_ids[0] if list_item_ids else 1,
            },
            {
                "content": "Already purchased this last week!",
                "author": "Alice",
                "parent_type": CommentParentType.list_item,
                "parent_id": list_item_ids[1] if len(list_item_ids) > 1 else 2,
            },
            {
                "content": "Not sure about this one, might be duplicate of another gift",
                "author": "Carol",
                "parent_type": CommentParentType.list_item,
                "parent_id": list_item_ids[2] if len(list_item_ids) > 2 else 3,
            },
            {
                "content": "Perfect! This is exactly what they wanted.",
                "author": "Alice",
                "parent_type": CommentParentType.list_item,
                "parent_id": list_item_ids[3] if len(list_item_ids) > 3 else 4,
            },
            # Comments on lists
            {
                "content": "This list is really well organized!",
                "author": "Bob",
                "parent_type": CommentParentType.list,
                "parent_id": list_ids[0] if list_ids else 1,
            },
            {
                "content": "Let's coordinate to avoid duplicate purchases",
                "author": "Carol",
                "parent_type": CommentParentType.list,
                "parent_id": list_ids[1] if len(list_ids) > 1 else 2,
            },
            # Comments on occasions
            {
                "content": "Don't forget to RSVP for the party!",
                "author": "Alice",
                "parent_type": CommentParentType.occasion,
                "parent_id": self.occasions["Next Week Holiday"].id,
            },
            {
                "content": "We should plan something special for this milestone birthday",
                "author": "Bob",
                "parent_type": CommentParentType.occasion,
                "parent_id": self.occasions["Grandma's 75th Birthday"].id,
            },
            # Comments on persons
            {
                "content": "She's allergic to lavender, avoid anything scented with it",
                "author": "Alice",
                "parent_type": CommentParentType.person,
                "parent_id": self.people["Grandma Betty"].id,
            },
            {
                "content": "He recently mentioned wanting to upgrade his golf clubs",
                "author": "Carol",
                "parent_type": CommentParentType.person,
                "parent_id": self.people["Uncle Tom"].id,
            },
            {
                "content": "Super into art right now, anything creative would be great",
                "author": "Bob",
                "parent_type": CommentParentType.person,
                "parent_id": self.people["Cousin Emma"].id,
            },
        ]

        for comment_data in comments_data:
            comment = Comment(
                content=comment_data["content"],
                author_id=self.users[comment_data["author"]].id,
                parent_type=comment_data["parent_type"],
                parent_id=comment_data["parent_id"],
            )
            session.add(comment)
            author = comment_data["author"]
            parent_type = comment_data["parent_type"].value
            print(f"  ✓ Added comment by {author} on {parent_type}")

        await session.commit()
        print(f"✅ Created {len(comments_data)} comments")

    async def populate_all(self) -> None:
        """
        Main orchestration method that populates all test data.

        Execution order:
          1. Reset database using reset_dev_db.py
          2. Create Users
          3. Create People
          4. Create Occasions
          5. Create Tags
          6. Create Gifts
          7. Create Lists
          8. Create ListItems
          9. Create Comments
        """
        print("\n" + "=" * 70)
        print("  Family Gifting Dashboard - Test Data Population")
        print("=" * 70)

        # Reset database using reset_dev_db.py
        await self.reset_database()

        # Create all data in dependency order
        async with async_session_maker() as session:
            await self.create_users(session)
            await self.create_people(session)
            await self.create_occasions(session)
            await self.create_tags(session)
            await self.create_gifts(session)
            await self.create_lists(session)
            await self.create_list_items(session)
            await self.create_comments(session)

        print("\n" + "=" * 70)
        print("  ✅ Test data population completed successfully!")
        print("=" * 70)
        print("\n📊 Summary:")
        print(f"  - {len(self.users)} users")
        print(f"  - {len(self.people)} people")
        print(f"  - {len(self.occasions)} occasions")
        print(f"  - {len(self.tags)} tags")
        print(f"  - {len(self.gifts)} gifts")
        print(f"  - {len(self.lists)} lists")
        print("  - 26 list items")
        print("  - 11 comments")
        print("\n👤 Test Users (all passwords: testpass1):")
        print("  - alice@family.test")
        print("  - bob@family.test")
        print("  - carol@family.test")
        print()


async def main() -> None:
    """
    Main entry point with confirmation prompt.

    Checks for --yes flag to skip confirmation.
    """
    # Check for help flag
    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__)
        sys.exit(0)

    # Check for --yes flag
    skip_confirm = "--yes" in sys.argv or "-y" in sys.argv

    if not skip_confirm:
        print("\n" + "⚠️  " * 20)
        print("\n  WARNING: This will DELETE ALL DATA in the database!")
        print("  All tables will be dropped and recreated.")
        print("  This action is IRREVERSIBLE.")
        print("\n" + "⚠️  " * 20)
        print("\nAre you sure you want to continue? (type 'yes' to confirm): ", end="")

        confirmation = input().strip().lower()
        if confirmation != "yes":
            print("\n❌ Operation cancelled. No changes made.")
            sys.exit(0)

    try:
        populator = TestDataPopulator()
        await populator.populate_all()
    except Exception as e:
        print(f"\n❌ Error during population: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
