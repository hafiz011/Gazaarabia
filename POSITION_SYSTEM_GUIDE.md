# Dynamic Positioning System — Best Practices & Scaling

## Architecture Overview

```
Frontend (React)
    ↓
dnd-kit (Drag & Drop)
    ↓
Service Layer (submenuService.reorder)
    ↓
API Route (PUT /api/submenus/reorder)
    ↓
Prisma Transaction
    ↓
MySQL Database
```

---

## 1. **Database Constraints**

### Ensure Position Field is Indexed
```sql
ALTER TABLE submenus ADD INDEX idx_menuId_position (menuId, position);
```

### Enforce NOT NULL + DEFAULT
```sql
ALTER TABLE submenus MODIFY COLUMN position INT NOT NULL DEFAULT 0;
```

### Prevent Duplicate Slugs per Menu
```sql
ALTER TABLE submenus ADD UNIQUE KEY unique_slug_per_menu (menuId, slug);
```

---

## 2. **API Best Practices**

### ✅ DO

- **Use Transactions**: Always wrap position updates in `prisma.$transaction()`
- **Validate Ownership**: Verify all items belong to the same menu before reordering
- **Normalize on Save**: Ensure positions are sequential (0, 1, 2, ...)
- **Return Full State**: Return all submenus for the menu after reordering (so client can sync)
- **Add Logging**: Log reorder events for audit trails
- **Rate Limit**: Add rate limiting to prevent abuse (e.g., 10 reorders/minute per user)

### ❌ DON'T

- Don't accept position from client during creation (calculate server-side)
- Don't allow cross-menu reordering (enforce menuId validation)
- Don't skip position recalculation after deletion
- Don't use Promise.all for updates (use transactions instead)
- Don't trust client-side positions (always recalculate)

---

## 3. **Frontend Optimizations**

### Optimistic Updates
```typescript
// Update UI immediately
setSubmenus(optimisticState);

// If API fails, rollback
try {
  await api.reorder(...);
} catch {
  await fetchSubmenus(); // Refetch to sync
}
```

### Group by Menu for Drag & Drop
Only allow dragging within the same menu:
```typescript
const groupedByMenu = useMemo(() => {
  const grouped: { [key: number]: any[] } = {};
  items.forEach((item) => {
    if (!grouped[item.menuId]) grouped[item.menuId] = [];
    grouped[item.menuId].push(item);
  });
  return grouped;
}, [items]);
```

### Disable Interactions While Reordering
```typescript
<input disabled={isReordering} />
<button disabled={isReordering} />
```

### Use useCallback for Event Handlers
```typescript
const handleDragEnd = useCallback(async (event) => {
  // expensive operation
}, [dependencies]);
```

---

## 4. **Scaling Considerations**

### Problem: Large Datasets (1000+ submenus per menu)

**Solutions:**

1. **Pagination + Virtual Scrolling**
   - Display 50 items per page
   - Only render visible items in viewport
   - Use react-window or react-virtual

2. **Debounce API Calls**
   - Wait 500ms after last drag before sending
   - Batch multiple position changes

3. **Lazy Load Related Data**
   - Don't include full menu object in list
   - Fetch menu data separately or on demand

4. **Database Optimization**
   ```sql
   -- Add covering index
   ALTER TABLE submenus ADD INDEX idx_menu_position_id 
   (menuId, position, id);
   ```

### Problem: Concurrent Updates (Multiple Users)

**Solutions:**

1. **Optimistic Locking (Versioning)**
   ```typescript
   // Add version field to Submenus model
   model Submenus {
     ...
     version Int @default(1)
   }

   // In reorder API
   WHERE menuId = ? AND version = ?
   ```

2. **Conflict Resolution Strategy**
   - Server-side reconciliation: Use "last-write-wins" (simplest)
   - Timestamps: Track `lastReorderedAt` per menu
   - Return error if version mismatch, client refetches

3. **WebSocket for Real-Time Sync** (Future)
   - Push updates to all clients when position changes
   - Broadcast via Socket.io or WebSockets

---

## 5. **Error Handling**

### Graceful Degradation
```typescript
try {
  await reorder();
} catch (error) {
  if (error.status === 409) {
    // Conflict: Concurrent update detected
    alert("Another user updated this. Refreshing...");
    await refetch();
  } else if (error.status === 400) {
    // Bad request: Invalid data
    alert("Invalid reorder data");
  } else {
    // Server error: Rollback
    alert("Failed to save. Reverting...");
    await refetch();
  }
}
```

### Logging
```typescript
console.log({
  event: "reorder_start",
  menuId,
  itemCount: items.length,
  userId,
  timestamp: new Date(),
});
```

---

## 6. **Testing Strategy**

### Unit Tests
```typescript
describe("positionService", () => {
  it("should normalize positions", () => {
    const input = [
      { id: 1, position: 2 },
      { id: 2, position: 0 },
      { id: 3, position: 1 },
    ];
    const result = normalizePositions(input);
    expect(result[0].position).toBe(0);
    expect(result[1].position).toBe(1);
  });

  it("should detect position conflicts", () => {
    const input = [
      { id: 1, position: 0 },
      { id: 2, position: 0 }, // Duplicate
    ];
    const conflicts = findPositionConflicts(input);
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests
```typescript
describe("PUT /api/submenus/reorder", () => {
  it("should reorder submenus in transaction", async () => {
    const response = await PUT(req, { menuId: 1, items: [...] });
    expect(response.success).toBe(true);
    expect(response.data[0].position).toBe(0);
  });

  it("should reject cross-menu reordering", async () => {
    // Items from different menus
    const response = await PUT(req, { menuId: 1, items: crossMenuItems });
    expect(response.status).toBe(400);
  });
});
```

---

## 7. **Performance Monitoring**

### Metrics to Track
- **Reorder latency**: Time from drag-end to API response
- **Database query time**: Time to update all positions
- **Render time**: Time to re-render table after update
- **Error rate**: % of failed reorder attempts

### Example Instrumentation
```typescript
const startTime = performance.now();

await submenuService.reorder(token, menuId, items);

const duration = performance.now() - startTime;
console.log({
  event: "reorder_complete",
  duration,
  itemCount: items.length,
  success: true,
});

// Send to analytics
analytics.track("reorder_complete", { duration });
```

---

## 8. **API Contract (Documentation)**

### PUT /api/submenus/reorder

**Request:**
```json
{
  "menuId": 1,
  "items": [
    { "id": 5, "position": 0 },
    { "id": 2, "position": 1 },
    { "id": 8, "position": 2 }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Submenus reordered successfully",
  "data": [
    { "id": 5, "position": 0, "name": "...", ... },
    { "id": 2, "position": 1, "name": "...", ... },
    { "id": 8, "position": 2, "name": "...", ... }
  ]
}
```

**Response (Error - Conflict):**
```json
{
  "success": false,
  "message": "Some submenus do not belong to the specified menu",
  "status": 400
}
```

---

## 9. **Monitoring & Maintenance**

### Scheduled Consistency Check
Run every 24 hours:
```sql
-- Find menus with position gaps
SELECT menuId, COUNT(*) as cnt, MAX(position) as max_pos
FROM submenus
GROUP BY menuId
HAVING cnt != max_pos + 1;
```

### Auto-Repair Script
```typescript
export const repairPositions = async (menuId: number) => {
  const items = await prisma.submenus.findMany({
    where: { menuId },
    orderBy: { position: "asc" },
  });

  for (let i = 0; i < items.length; i++) {
    if (items[i].position !== i) {
      await prisma.submenus.update({
        where: { id: items[i].id },
        data: { position: i },
      });
    }
  }
};
```

---

## 10. **Deployment Checklist**

- [ ] Database index added: `(menuId, position)`
- [ ] Prisma migration created
- [ ] Position field is NOT NULL with DEFAULT 0
- [ ] Transaction support verified in database
- [ ] Error handling implemented
- [ ] Logging added to reorder API
- [ ] Frontend optimistic updates working
- [ ] Drag & drop disabled during reordering
- [ ] Tests passing (unit + integration)
- [ ] Performance baseline recorded
- [ ] Rate limiting configured (if applicable)
- [ ] Admin-only access verified

---

## Summary

This system is production-ready when:
1. ✅ Positions are always sequential (0, 1, 2, ...)
2. ✅ Reordering uses transactions
3. ✅ Menu ownership is validated
4. ✅ Client optimistic updates with server sync
5. ✅ Errors are handled gracefully
6. ✅ Monitoring is in place

Scale by adding pagination, caching, and WebSockets as needed.
