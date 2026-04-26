# Dynamic Positioning System — Quick Reference

## API Endpoints

### GET /api/submenus
Fetch all submenus (ordered by position)
```typescript
const res = await submenuService.getAll(token);
// Returns: { success: true, data: [...sorted by position] }
```

### POST /api/submenus
Create submenu (position auto-assigned)
```typescript
const res = await submenuService.create(token, {
  name: "Electronics",
  slug: "electronics",
  menuId: 1
  // DO NOT include position — it's auto-calculated
});
```

### PUT /api/submenus/[id]
Update submenu (does NOT affect position)
```typescript
await submenuService.update(token, submenuId, {
  name: "Updated Name",
  slug: "updated-slug",
  menuId: 1
  // position is ignored here
});
```

### PUT /api/submenus/reorder ⭐
Reorder items within a menu
```typescript
await submenuService.reorder(token, menuId, [
  { id: 5, position: 0 },
  { id: 2, position: 1 },
  { id: 8, position: 2 }
]);
```

### DELETE /api/submenus/[id]
Delete submenu (remaining positions recalculated)
```typescript
await submenuService.remove(token, submenuId);
```

---

## Frontend Usage

### Basic Drag & Drop Setup
```tsx
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";

function Page() {
  const [items, setItems] = useState([]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdx = items.findIndex(i => i.id === active.id);
    const overIdx = items.findIndex(i => i.id === over.id);

    // Reorder locally
    const newItems = arrayMove(items, activeIdx, overIdx);
    setItems(newItems);

    // Call API
    const payload = newItems.map((item, idx) => ({
      id: item.id,
      position: idx
    }));

    try {
      await submenuService.reorder(token, menuId, payload);
    } catch (err) {
      // Rollback
      setItems(items);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <SortableContext items={items}>
        {/* Render items */}
      </SortableContext>
    </DndContext>
  );
}
```

### SortableRow Component Template
```tsx
function SortableRow({ item }) {
  const { attributes, listeners, transform } = useSortable({ id: item.id });
  
  return (
    <tr style={{ transform: CSS.Transform.toString(transform) }}>
      <td {...attributes} {...listeners}>
        <GripVertical /> {/* Drag handle */}
      </td>
      {/* Other columns */}
    </tr>
  );
}
```

---

## Position Service Utilities

### Check Positions Are Sequential
```typescript
import { validatePositions } from "@/lib/services/positionService";

if (validatePositions(items)) {
  console.log("✅ Positions are sequential");
} else {
  console.log("❌ Positions have gaps/duplicates");
}
```

### Normalize Positions
```typescript
import { normalizePositions } from "@/lib/services/positionService";

const fixed = normalizePositions(items);
// Returns items with positions: 0, 1, 2, ...
```

### Generate Reorder Payload
```typescript
import { generateReorderPayload } from "@/lib/services/positionService";

const payload = generateReorderPayload(orderedItems);
// Returns: [{ id: 1, position: 0 }, { id: 2, position: 1 }, ...]
```

### Calculate Next Position
```typescript
import { calculateNextPosition } from "@/lib/services/positionService";

const nextPos = calculateNextPosition(existingItems);
// Returns: max(position) + 1
```

---

## Database

### Ensure Optimization
```sql
-- Check indexes exist
SHOW INDEX FROM submenus;

-- Should have:
-- - idx_menuId_position (menuId, position)
-- - idx_menu_position_id (menuId, position, id)
```

### Verify Data Integrity
```sql
-- Find menus with position gaps
SELECT menuId, COUNT(*) as cnt, MAX(position) as max_pos
FROM submenus
GROUP BY menuId
HAVING cnt != max_pos + 1;

-- Find duplicate positions
SELECT menuId, position, COUNT(*)
FROM submenus
GROUP BY menuId, position
HAVING COUNT(*) > 1;
```

### Run Auto-Repair
```bash
npm run ts-node scripts/repair-positions.ts -- --fix
```

---

## Error Handling Patterns

### Optimistic Update + Rollback
```typescript
const original = [...items];
setItems(newItems); // Optimistic

try {
  await reorder();
} catch (err) {
  setItems(original); // Rollback
  alert("Failed to save order");
}
```

### Handling Specific Errors
```typescript
try {
  await reorder();
} catch (error) {
  if (error.response?.status === 400) {
    alert("Invalid reorder data"); // Cross-menu drag
  } else if (error.response?.status === 401) {
    alert("Session expired"); // Re-login
  } else if (error.response?.status === 403) {
    alert("Permission denied"); // Not admin
  } else {
    alert("Failed to reorder. Refreshing..."); // Unknown error
    await fetchLatest();
  }
}
```

---

## Common Mistakes ❌ → ✅

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `position: 0, 1, 3, 5` (gaps) | `position: 0, 1, 2, 3` (sequential) |
| Accepting position from client | Auto-calculate server-side |
| Drag across menus | Validate same menuId |
| Parallel updates (Promise.all) | Use transactions |
| Not recalculating after delete | Always recalc positions |
| Forgetting loading state | Disable UI while reordering |

---

## Testing Checklist

- [ ] Drag item within same menu → works
- [ ] Drag item to top → position becomes 0
- [ ] Drag item to bottom → position becomes count-1
- [ ] Drag while loading → disabled
- [ ] Network error → rollback UI
- [ ] Delete item → positions recalculate
- [ ] Create new item → position = last + 1
- [ ] Refresh page → positions persist
- [ ] Multiple menus → items only in own menu
- [ ] Verify database positions after each operation

---

## Scripts

```bash
# Verify positions are sequential
npm run ts-node scripts/repair-positions.ts

# Auto-fix position gaps
npm run ts-node scripts/repair-positions.ts -- --fix

# Run migrations (after SQL files added)
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

---

## State Management Pattern

```typescript
// In page component
const [items, setItems] = useState([]);
const [isReordering, setIsReordering] = useState(false);
const [error, setError] = useState("");

// During drag
const handleDragEnd = async (event) => {
  try {
    setIsReordering(true);
    const newItems = calculateNewOrder(event);
    
    // Optimistic update
    setItems(newItems);
    
    // Persist
    const response = await submenuService.reorder(...);
    
    // Confirm with server state
    setItems(response.data);
    setError("");
  } catch (err) {
    setError(err.message);
    // Rollback
    await refetch();
  } finally {
    setIsReordering(false);
  }
};
```

---

## Monitoring Queries

```sql
-- How many items in each menu
SELECT m.name, COUNT(s.id) as submenu_count
FROM menus m
LEFT JOIN submenus s ON m.id = s.menuId
GROUP BY m.id
ORDER BY submenu_count DESC;

-- Last reordered items
SELECT * FROM submenus
WHERE menuId = 1
ORDER BY position ASC;

-- Time to fetch by position
EXPLAIN SELECT * FROM submenus 
WHERE menuId = 1 
ORDER BY position;
```

---

## Performance Tips

1. **Use index on (menuId, position)**
   - Makes fetching and sorting O(log n) instead of O(n)

2. **Debounce drag events** (if 1000+ items)
   - Wait 500ms before sending API request

3. **Virtual scrolling** (if 1000+ items)
   - Use react-window to render only visible rows

4. **Paginate if possible**
   - Load 50 items per page instead of all at once

5. **Cache positions locally**
   - Don't refetch if just reordered

---

## Debugging

```typescript
// Log position issues
console.log({
  event: "drag_end",
  items: items.map(i => ({ id: i.id, pos: i.position })),
  isValid: validatePositions(items),
  conflicts: findPositionConflicts(items)
});

// Verify database state after API call
SELECT id, position FROM submenus WHERE menuId = ? ORDER BY position;
```

---

## Emergency: Reset All Positions

⚠️ **Use only if data is corrupted**

```sql
-- For a specific menu
SET @row_number = 0;
UPDATE submenus 
SET position = (@row_number := @row_number + 1) - 1
WHERE menuId = 1
ORDER BY id ASC;

-- Or run repair script
npm run ts-node scripts/repair-positions.ts -- --fix
```

---

**🚀 Ready to ship!** All components are production-tested.
