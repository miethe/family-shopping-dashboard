# Gift-Person Linking: Code Snippets Reference

Complete code snippets from the explored files for quick reference.

---

## 1. Frontend: Person Modal - Linked Entities Tab

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/modals/PersonDetailModal.tsx`

**Lines 585-694: Linked Entities Tab Content**

```tsx
{/* Linked Entities Tab */}
<TabsContent value="linked" className="space-y-6">
  {/* Gifts Section */}
  <div className="space-y-3">
    <h3 className="font-semibold text-warm-900 text-lg mb-1">
      Gifts
    </h3>
    <p className="text-warm-600 text-sm mb-4">
      Gifts linked to this person
    </p>
    <LinkedGiftsSection
      personId={person.id}
      onOpenGiftDetail={openGiftModal}
    />
  </div>

  {/* Lists Section */}
  <div className="space-y-3 pt-6 border-t border-warm-200">
    {listsLoading ? (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    ) : lists.length > 0 ? (
      <div className="space-y-3">
        <h3 className="font-semibold text-warm-900 text-sm mb-3">
          Lists for this person
        </h3>

        {lists.map((list: GiftList) => (
          <Card
            key={list.id}
            variant="interactive"
            padding="default"
            onClick={() => openListModal(String(list.id))}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-warm-900 truncate">
                  {list.name}
                </h4>
                <p className="text-sm text-warm-600">
                  {list.item_count || 0} {list.item_count === 1 ? 'item' : 'items'}
                </p>
              </div>
              <Badge variant="default" className="ml-3">
                {list.type}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    ) : (
      <div className="space-y-3">
        {/* Empty state... */}
      </div>
    )}
  </div>
</TabsContent>
```

---

## 2. Frontend: LinkedGiftsSection Component

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/people/LinkedGiftsSection.tsx`

**Lines 31-149: Main Component**

```tsx
export function LinkedGiftsSection({
  personId,
  onOpenGiftDetail,
}: LinkedGiftsSectionProps) {
  const router = useRouter();
  const { data: giftsData, isLoading } = useGiftsByPerson(personId);

  // Group gifts by purchase status
  const { pendingGifts, purchasedGifts } = React.useMemo(() => {
    const gifts = giftsData?.items || [];
    const pending: Gift[] = [];
    const purchased: Gift[] = [];

    gifts.forEach((gift) => {
      if (gift.purchase_date) {
        purchased.push(gift);
      } else {
        pending.push(gift);
      }
    });

    return {
      pendingGifts: pending,
      purchasedGifts: purchased,
    };
  }, [giftsData?.items]);

  const handleAddGift = () => {
    // Navigate to new gift page with person pre-selected
    router.push(`/gifts/new?person_id=${personId}`);
  };

  const handleGiftClick = (giftId: number) => {
    if (onOpenGiftDetail) {
      onOpenGiftDetail(String(giftId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  const hasGifts = pendingGifts.length > 0 || purchasedGifts.length > 0;

  return (
    <div className="space-y-6">
      {/* Pending Gifts Section */}
      {pendingGifts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-warm-900 uppercase tracking-wide">
            Pending Gifts ({pendingGifts.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pendingGifts.map((gift) => (
              <MiniGiftCard
                key={gift.id}
                gift={gift}
                onClick={() => handleGiftClick(gift.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Purchased Gifts Section */}
      {purchasedGifts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-warm-900 uppercase tracking-wide">
            Purchased Gifts ({purchasedGifts.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {purchasedGifts.map((gift) => (
              <MiniGiftCard
                key={gift.id}
                gift={gift}
                onClick={() => handleGiftClick(gift.id)}
                isPurchased
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasGifts && (
        <div className="bg-warm-50 rounded-xl p-12 border border-warm-200 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-warm-100 rounded-full p-4 mb-4">
              <GiftIcon className="h-8 w-8 text-warm-400" />
            </div>
            <h4 className="font-semibold text-warm-900 text-base mb-1">
              No Gifts Yet
            </h4>
            <p className="text-warm-600 text-sm mb-4">
              No gifts have been linked to this person yet
            </p>
          </div>
        </div>
      )}

      {/* Add Gift Button */}
      <div className="flex justify-center pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={handleAddGift}
          className="min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Gift
        </Button>
      </div>
    </div>
  );
}
```

---

## 3. Frontend: useGiftsByPerson Hook

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/hooks/useGifts.ts`

**Lines 41-46: Fetch gifts linked to a specific person**

```typescript
/**
 * Fetch gifts linked to a specific person
 * Convenience wrapper around useGifts with person_ids filter
 * @param personId - Person ID to filter by
 * @param options - Additional query options
 */
export function useGiftsByPerson(personId: number, options: UseGiftsOptions = {}) {
  return useGifts(
    { person_ids: [personId] },
    { ...options, enabled: options.enabled !== false && !!personId }
  );
}
```

**Lines 21-33: Base useGifts hook**

```typescript
/**
 * Fetch paginated list of gifts with optional filters
 * @param params - Optional cursor, limit, search, tags, person_ids, statuses, list_ids, occasion_ids filters
 */
export function useGifts(params?: GiftListParams, options: UseGiftsOptions = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftApi.list(params),
    staleTime: 1000 * 60 * 5, // 5 minutes - moderate updates, search-heavy
    refetchOnWindowFocus: true,
    enabled,
  });

  return query;
}
```

---

## 4. Backend: GET /gifts Endpoint

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/api/gifts.py`

**Lines 23-115: List and filter gifts endpoint**

```python
@router.get(
    "",
    response_model=PaginatedResponse[GiftResponse],
    status_code=status.HTTP_200_OK,
    summary="List and filter gifts with pagination",
    description="Get paginated list of gifts with optional filtering by recipient, status, list, occasion, and search",
)
async def list_gifts(
    cursor: int | None = Query(None, description="Cursor for pagination (ID of last item)"),
    limit: int = Query(50, ge=1, le=100, description="Maximum items to return"),
    search: str | None = Query(None, min_length=2, description="Search query for gift name (case-insensitive)"),
    person_ids: list[int] | None = Query(None, description="Filter by recipient person IDs (OR logic)"),
    statuses: list[str] | None = Query(None, description="Filter by list item statuses (OR logic)"),
    list_ids: list[int] | None = Query(None, description="Filter by list IDs (OR logic)"),
    occasion_ids: list[int] | None = Query(None, description="Filter by occasion IDs (OR logic)"),
    sort: str = Query("recent", description="Sort order: 'recent' (default), 'price_asc', 'price_desc'"),
    current_user_id: int = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[GiftResponse]:
    """
    Get paginated and filtered list of gifts.

    Supports filtering by:
    - Search: Case-insensitive substring match on gift name
    - Person: Filter by recipient person IDs
    - Status: Filter by list item statuses (idea/selected/purchased/received)
    - List: Filter by specific list IDs
    - Occasion: Filter by occasion IDs
    """
    service = GiftService(db)
    gifts, has_more, next_cursor = await service.list(
        cursor=cursor,
        limit=limit,
        search=search,
        person_ids=person_ids,
        statuses=statuses,
        list_ids=list_ids,
        occasion_ids=occasion_ids,
        sort_by=sort,
    )

    return PaginatedResponse(items=gifts, has_more=has_more, next_cursor=next_cursor)
```

---

## 5. Backend: GiftRepository.get_filtered() - Core Query

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/repositories/gift.py`

**Lines 255-400: Filtered list with cursor pagination**

```python
async def get_filtered(
    self,
    cursor: int | None = None,
    limit: int = 50,
    search: str | None = None,
    person_ids: list[int] | None = None,
    statuses: list[str] | None = None,
    list_ids: list[int] | None = None,
    occasion_ids: list[int] | None = None,
    sort_by: str = "recent",
) -> tuple[list[Gift], bool, int | None]:
    """
    Get filtered list of gifts with cursor-based pagination.

    Filters gifts by recipient (person), status, list, and occasion through
    the Gift → ListItem → List relationship chain.
    """
    # Step 1: Build subquery for distinct gift IDs with all filters
    id_subquery = select(distinct(self.model.id).label("gift_id")).select_from(self.model)

    # Track if we need to join ListItem and List tables
    need_list_item_join = bool(statuses or list_ids or person_ids or occasion_ids)

    # Join through ListItem to List if filtering by list-related fields
    if need_list_item_join:
        id_subquery = id_subquery.join(ListItem, self.model.id == ListItem.gift_id)
        id_subquery = id_subquery.join(List, ListItem.list_id == List.id)

    # Apply filters (AND logic across groups)
    filters = []

    # Search by name (case-insensitive)
    if search:
        filters.append(func.lower(self.model.name).contains(func.lower(search)))

    # Filter by person (recipient) - OR logic within group
    # CRITICAL: Uses List.person_id (list ownership), not gift_people.person_id
    if person_ids:
        filters.append(List.person_id.in_(person_ids))

    # Filter by list item status - OR logic within group
    if statuses:
        filters.append(ListItem.status.in_(statuses))

    # Filter by list ID - OR logic within group
    if list_ids:
        filters.append(ListItem.list_id.in_(list_ids))

    # Filter by occasion - OR logic within group
    if occasion_ids:
        filters.append(List.occasion_id.in_(occasion_ids))

    # Apply all filters to subquery
    if filters:
        id_subquery = id_subquery.where(*filters)

    # Convert to subquery
    id_subquery = id_subquery.subquery()

    # Step 2: Select full Gift models where ID is in the subquery
    stmt = (
        select(self.model)
        .options(
            selectinload(self.model.people),
            selectinload(self.model.stores),
        )
        .where(self.model.id.in_(select(id_subquery.c.gift_id)))
    )

    # Apply cursor pagination
    if cursor is not None:
        stmt = stmt.where(self.model.id > cursor)

    # Apply sorting
    if sort_by == "price_asc":
        stmt = stmt.order_by(self.model.price.asc().nulls_last(), self.model.id.asc())
    elif sort_by == "price_desc":
        stmt = stmt.order_by(self.model.price.desc().nulls_last(), self.model.id.asc())
    else:  # recent (default - newest first)
        stmt = stmt.order_by(self.model.id.desc())

    # Fetch limit + 1 to determine if there are more results
    stmt = stmt.limit(limit + 1)

    # Execute query
    result = await self.session.execute(stmt)
    gifts = list(result.scalars().all())

    # Check if there are more results
    has_more = len(gifts) > limit
    if has_more:
        gifts = gifts[:limit]  # Trim to requested limit

    # Determine next cursor
    next_cursor = gifts[-1].id if (gifts and has_more) else None

    return gifts, has_more, next_cursor
```

---

## 6. Backend: GiftPerson Model (Junction Table)

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/models/gift_person.py`

**Lines 17-83: Gift-Person association**

```python
class GiftPersonRole(str, enum.Enum):
    """Role types for gift-person relationships."""

    RECIPIENT = "recipient"
    PURCHASER = "purchaser"
    CONTRIBUTOR = "contributor"  # For shared purchases


class GiftPerson(BaseModel):
    """
    Association entity linking gifts to persons.

    This junction table enables many-to-many relationships between gifts and persons,
    allowing gifts to be associated with multiple recipients and persons to have
    multiple gifts.

    Attributes:
        id: Primary key (inherited from BaseModel)
        gift_id: Foreign key to gifts table
        person_id: Foreign key to persons table
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "gift_people"

    gift_id: Mapped[int] = mapped_column(
        ForeignKey("gifts.id", ondelete="CASCADE"),
        nullable=False,
    )

    person_id: Mapped[int] = mapped_column(
        ForeignKey("persons.id", ondelete="CASCADE"),
        nullable=False,
    )

    role: Mapped[GiftPersonRole] = mapped_column(
        SQLEnum(
            GiftPersonRole,
            name="gift_person_role",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        default=GiftPersonRole.RECIPIENT,
        nullable=False,
    )

    # Relationships to parent entities
    gift: Mapped["Gift"] = relationship(
        "Gift",
        foreign_keys=[gift_id],
        lazy="select",
    )

    person: Mapped["Person"] = relationship(
        "Person",
        foreign_keys=[person_id],
        lazy="select",
    )

    __table_args__ = (
        UniqueConstraint("gift_id", "person_id", "role", name="uq_gift_person_role"),
    )
```

---

## 7. Backend: PersonRepository.get_gift_budget()

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/repositories/person.py`

**Lines 294-445: Budget calculation (simplified)**

```python
async def get_gift_budget(
    self,
    person_id: int,
    occasion_id: int | None = None,
) -> PersonBudgetResult:
    """
    Calculate gift budget totals for a person.

    Calculates:
    - Gifts assigned TO this person (recipient role)
    - Gifts purchased BY this person (purchaser_id)
    """

    # Query 1: Gifts assigned to this person as recipient
    assigned_stmt = (
        select(
            func.count(Gift.id).label("count"),
            func.coalesce(func.sum(Gift.price), Decimal("0")).label("total"),
        )
        .select_from(Gift)
        .join(GiftPerson, Gift.id == GiftPerson.gift_id)
        .where(
            GiftPerson.person_id == person_id,
            GiftPerson.role == GiftPersonRole.RECIPIENT,  # KEY: Uses GiftPerson table!
        )
    )
    assigned_result = await self.session.execute(assigned_stmt)
    assigned_row = assigned_result.one()

    # Query 2: Gifts purchased by this person
    purchased_stmt = (
        select(
            func.count(Gift.id).label("count"),
            func.coalesce(func.sum(Gift.price), Decimal("0")).label("total"),
        )
        .select_from(Gift)
        .where(
            Gift.purchaser_id == person_id,
            Gift.purchase_date.isnot(None),
        )
    )
    purchased_result = await self.session.execute(purchased_stmt)
    purchased_row = purchased_result.one()

    # Query 3: Assigned gifts that have been purchased
    assigned_purchased_stmt = (
        select(
            func.count(Gift.id).label("count"),
            func.coalesce(func.sum(Gift.price), Decimal("0")).label("total"),
        )
        .select_from(Gift)
        .join(GiftPerson, Gift.id == GiftPerson.gift_id)
        .where(
            GiftPerson.person_id == person_id,
            GiftPerson.role == GiftPersonRole.RECIPIENT,
            Gift.purchase_date.isnot(None),
        )
    )
    assigned_purchased_result = await self.session.execute(assigned_purchased_stmt)
    assigned_purchased_row = assigned_purchased_result.one()

    # Query 4: Gifts to purchase (assigned as purchaser but not yet bought)
    to_purchase_stmt = (
        select(
            func.count(Gift.id).label("count"),
            func.coalesce(func.sum(Gift.price), Decimal("0")).label("total"),
        )
        .select_from(Gift)
        .where(
            Gift.purchaser_id == person_id,
            Gift.purchase_date.is_(None),
        )
    )
    to_purchase_result = await self.session.execute(to_purchase_stmt)
    to_purchase_row = to_purchase_result.one()

    return PersonBudgetResult(
        person_id=person_id,
        occasion_id=occasion_id,
        gifts_assigned_count=int(assigned_row[0] or 0),
        gifts_assigned_total=Decimal(assigned_row[1] or 0),
        gifts_purchased_count=int(purchased_row[0] or 0),
        gifts_purchased_total=Decimal(purchased_row[1] or 0),
        gifts_assigned_purchased_count=int(assigned_purchased_row[0] or 0),
        gifts_assigned_purchased_total=Decimal(assigned_purchased_row[1] or 0),
        gifts_to_purchase_count=int(to_purchase_row[0] or 0),
        gifts_to_purchase_total=Decimal(to_purchase_row[1] or 0),
    )
```

---

## 8. Backend: GiftRepository - Attach People

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/repositories/gift.py`

**Lines 422-448: Attach multiple people to a gift**

```python
async def attach_people(self, gift_id: int, person_ids: list[int]) -> None:
    """
    Attach multiple people to a gift. Skips duplicates.

    Args:
        gift_id: Gift ID to attach people to
        person_ids: List of person IDs to attach

    Example:
        ```python
        await repo.attach_people(gift_id=123, person_ids=[1, 2, 3])
        ```

    Note:
        - Automatically skips existing links (no duplicates)
        - Commits changes to database
    """
    # Get existing person IDs
    existing = set(await self.get_linked_people(gift_id))

    # Add only new links
    for person_id in person_ids:
        if person_id not in existing:
            link = GiftPerson(gift_id=gift_id, person_id=person_id)
            self.session.add(link)

    await self.session.commit()
```

**Lines 402-420: Get person IDs linked to a gift**

```python
async def get_linked_people(self, gift_id: int) -> list[int]:
    """
    Get person IDs linked to a gift.

    Args:
        gift_id: Gift ID to get linked people for

    Returns:
        List of person IDs linked to the gift

    Example:
        ```python
        person_ids = await repo.get_linked_people(gift_id=123)
        print(f"Gift is linked to {len(person_ids)} people")
        ```
    """
    stmt = select(GiftPerson.person_id).where(GiftPerson.gift_id == gift_id)
    result = await self.session.execute(stmt)
    return list(result.scalars().all())
```

---

## 9. Backend: GiftService - Create with people

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api/app/services/gift.py`

**Lines 61-112: Create gift with linked people**

```python
async def create(self, data: GiftCreate) -> GiftResponse:
    """
    Create a new gift from provided data.

    Args:
        data: Gift creation data (name, url, price, person_ids, etc.)

    Returns:
        GiftResponse DTO with created gift details
    """
    additional_urls = [url.model_dump() for url in data.additional_urls]

    gift = await self.repo.create(
        {
            "name": data.name,
            "url": data.url,
            "price": data.price,
            "image_url": data.image_url,
            "source": data.source,
            "description": data.description,
            "notes": data.notes,
            "priority": data.priority,
            "quantity": data.quantity,
            "sale_price": data.sale_price,
            "purchase_date": data.purchase_date,
            "additional_urls": additional_urls,
        }
    )

    # Handle relationships
    if data.person_ids:
        await self.repo.set_people(gift.id, data.person_ids)  # KEY: Sets GiftPerson rows
    if data.store_ids:
        await self.repo.set_stores(gift.id, data.store_ids)

    gift_with_relations = await self.repo.get_with_relations(gift.id) or gift
    return self._to_response(gift_with_relations)
```

---

## 10. MiniGiftCard Component

**File**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/people/LinkedGiftsSection.tsx`

**Lines 151-218: Compact gift card for grid display**

```tsx
function MiniGiftCard({ gift, onClick, isPurchased = false }: MiniGiftCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        'hover:border-primary-400 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'bg-white border-warm-200',
        'min-h-[44px]'
      )}
    >
      <div className="space-y-2">
        {/* Image */}
        <div className="aspect-square rounded-md overflow-hidden bg-warm-100">
          {gift.image_url ? (
            <Image
              src={gift.image_url}
              alt={gift.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GiftIcon className="w-6 h-6 text-warm-300" />
            </div>
          )}
        </div>

        {/* Name */}
        <h4 className="text-sm font-medium text-warm-900 line-clamp-2 min-h-[2.5rem]">
          {gift.name}
        </h4>

        {/* Price */}
        <div className="flex items-center justify-between">
          {gift.price !== null && gift.price !== undefined ? (
            <span className={cn(
              'text-sm font-semibold',
              isPurchased ? 'text-warm-600' : 'text-primary-600'
            )}>
              ${formatPrice(gift.price)}
            </span>
          ) : (
            <span className="text-xs text-warm-400">No price</span>
          )}
          {isPurchased && (
            <span className="text-xs text-green-600 font-medium">Purchased</span>
          )}
        </div>
      </div>
    </button>
  );
}
```

---

## Key Takeaways from Code

1. **Frontend uses person_ids filter**: `useGiftsByPerson` → `useGifts({ person_ids: [X] })`

2. **Backend filters by List ownership**: `List.person_id.in_(person_ids)`
   - NOT `GiftPerson.person_id.in_(person_ids)`

3. **Budget uses GiftPerson**: `GiftPerson.person_id == X AND role = RECIPIENT`

4. **Status determined client-side**: Simple check of `purchase_date` null-ness

5. **Role information exists** in GiftPerson but **not used in LinkedGiftsSection**

6. **Eager loading prevents N+1**: `selectinload(Gift.people)` on every gift query

7. **Cursor pagination**: All list endpoints use `id > cursor` pattern

8. **Touch targets enforced**: `min-h-[44px]` on all interactive elements

---

**All code references are from actual production files - safe to use as reference implementations.**
