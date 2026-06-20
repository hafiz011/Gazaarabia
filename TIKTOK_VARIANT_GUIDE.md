# TikTok-Style Variant Management

## Overview

A modern, clean variant management interface inspired by TikTok Shop's seller dashboard. Combines quick add functionality with an inline-editable grid for a streamlined workflow.

---

## Components

### 1. **VariantsTikTokStyle** (Main)
The wrapper component that brings everything together.

```tsx
import { VariantsTikTokStyle } from "@/components/seller/VariantsTikTokStyle";

<VariantsTikTokStyle
  variants={variants}
  onVariantsChange={setVariants}
  colors={colors}
  sizes={sizes}
  basePrice={form.sellingPrice}
  onError={(msg) => showAlert(msg)}
/>
```

### 2. **VariantsQuickAdd** (Dialog)
Fast variant creation with color/size selection grid.

**Features:**
- Multi-select colors and sizes
- Visual color swatches
- Preview of combinations to be created
- Automatic duplicate detection
- "Select All" / "Deselect All" buttons

```tsx
<VariantsQuickAdd
  onVariantsAdd={(variants) => addToForm(variants)}
  colors={colors}
  sizes={sizes}
  basePrice={basePrice}
  existingVariants={variants}
/>
```

### 3. **VariantsGridManager** (Table)
Responsive table with inline editing and bulk operations.

**Features:**
- Inline edit: SKU, Price, Stock
- Color swatches for visual identification
- Image count with quick upload
- Active/inactive toggle
- Completion progress (%)
- Bulk operations: select, template, delete
- Quick stats dashboard

```tsx
<VariantsGridManager
  variants={variants}
  onVariantsChange={setVariants}
  colors={colors}
  sizes={sizes}
/>
```

---

## Integration into Product Form

### Step 1: Replace Old Variants Section

**Before:**
```tsx
{/* Old code */}
<div className="space-y-6">
  {variants.map((variant, idx) => (
    <VariantCard
      variant={variant}
      index={idx}
      colors={colors}
      // ... other props
    />
  ))}
</div>
```

**After:**
```tsx
import { VariantsTikTokStyle } from "@/components/seller/VariantsTikTokStyle";

<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
  <VariantsTikTokStyle
    variants={variants}
    onVariantsChange={setVariants}
    colors={colors}
    sizes={sizes}
    basePrice={form.sellingPrice}
    onError={(msg) =>
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: msg,
      })
    }
  />
</div>
```

### Step 2: Clean Up Old Handlers

Remove these functions (no longer needed):

```tsx
// DELETE THESE:
const handleVariantAdd = () => { ... };
const handleVariantChange = (idx, field, value) => { ... };
const handleVariantRemove = (idx) => { ... };
const handleVariantCopy = (idx) => { ... };
const validateVariants = () => { ... };
```

The new system handles all of this internally.

### Step 3: Update Submit Validation

Keep the submit validation but simplify it:

```tsx
if (variants.length === 0) {
  setAlertMessage({
    isOpen: true,
    type: "warning",
    message: "Please add at least one product variant.",
  });
  return;
}

// Validate each variant
for (const v of variants) {
  if (!v.colorId || !v.sizeId || !v.sku || !v.price || !v.stock || !v.images?.length) {
    setAlertMessage({
      isOpen: true,
      type: "warning",
      message: "Please complete all required fields for each variant.",
    });
    return;
  }
}
```

---

## UI/UX Features

### Quick Add Dialog

1. **Click "Quick Add" button** → Opens modal
2. **Select colors** with visual swatches
3. **Select sizes** with size labels
4. **See preview** of new combinations
5. **Avoid duplicates** - strikethrough existing combos
6. **Click "Create"** → Variants added to table

```
┌─────────────────────────────────────┐
│  Quick Add Variants                 │
├─────────────────────────────────────┤
│  Select Colors:                     │
│  [Red ✓] [Blue ✓] [Green]          │
│                                     │
│  Select Sizes:                      │
│  [XS] [S ✓] [M ✓] [L]              │
│                                     │
│  Preview: 4 new variants           │
│  ✓ Red - S                         │
│  ✓ Red - M                         │
│  ✓ Blue - S                        │
│  ✓ Blue - M                        │
├─────────────────────────────────────┤
│           [Cancel] [Create 4]      │
└─────────────────────────────────────┘
```

### Grid/Table View

```
┌──────────────────────────────────────────────────────────────────────┐
│ ☐ | Color & Size  | SKU      | Price | Stock | Images | Status | % │
├──────────────────────────────────────────────────────────────────────┤
│ ☐ | 🔴 Red / S    | SKU-001  | £25   | 100   | 4      | ●      | 100%
│ ☐ | 🔴 Red / M    | SKU-002  | £25   | 50    | 0      | ●      | 83%
│ ☐ | 🔵 Blue / S   | SKU-003  | £25   | 200   | 5      | ○      | 100%
│ ☐ | 🟢 Green / L  | SKU-004  | £25   | 75    | 3      | ●      | 100%
└──────────────────────────────────────────────────────────────────────┘
   ☐ Select All | 0 selected
```

### Inline Editing

- Click on any cell to edit
- Changes save immediately
- Validation shows inline errors
- Price and Stock fields show currency/units

### Bulk Operations

**Select variants** → **Toolbar appears**

```
┌─────────────────────────────────────────┐
│ ☐ | 4 selected | [Template] [Delete] │
└─────────────────────────────────────────┘
```

**Template Dialog:**
```
┌────────────────────────────────┐
│ Apply Template to 4 Variants   │
├────────────────────────────────┤
│ Price: [25.00]                │
│ Stock: [100]                   │
│ (Leave empty to skip)         │
├────────────────────────────────┤
│      [Cancel] [Apply]         │
└────────────────────────────────┘
```

### Progress Indicators

**Completion % per variant:**
- Checklist: Color ✓, Size ✓, SKU ✓, Price ✓, Stock ✓, Images ✓
- 0% = None complete
- 50% = 3/6 fields filled
- 100% = All fields complete

**Quick Stats Dashboard:**
```
┌──────────┬──────────┬─────────────┬──────────┐
│ Variants │  Active  │ With Images │ Complete │
├──────────┼──────────┼─────────────┼──────────┤
│    12    │    10    │      8      │    6     │
└──────────┴──────────┴─────────────┴──────────┘
```

---

## Workflows

### Workflow 1: Quick Grid (5 minutes)

1. **Click "Quick Add"**
2. Select: 3 colors (Red, Blue, Green)
3. Select: 2 sizes (S, M)
4. Create 6 variants automatically
5. **Fill inline:**
   - SKU (auto-suggest: `PRODUCT-RED-S`)
   - Price (copy from first)
   - Stock (copy from first)
6. Upload images per variant

### Workflow 2: Complete Template (2 minutes)

1. Quick Add: 5 colors × 4 sizes = 20 variants
2. Click first variant
3. Upload images
4. Select all variants (checkbox)
5. Click "Template"
6. Set Price: 29.99, Stock: 50
7. Click "Apply" → All 20 updated

### Workflow 3: Manual One-Off

1. Quick Add: Just 1 color + 1 size
2. Fill fields inline
3. Upload images
4. Done in < 1 minute

---

## Data Structure

### Input (from parent form)

```ts
variants: ProductVariant[]
onVariantsChange: (variants: ProductVariant[]) => void
colors: { id: number; name: string; hexCode?: string }[]
sizes: { id: number; name: string }[]
basePrice?: number
```

### Output (to parent form)

Same `ProductVariant[]` structure, ready to submit:

```ts
[
  {
    colorId: 1,
    sizeId: 2,
    sku: "PROD-RED-M",
    price: 29.99,
    stock: 100,
    isActive: true,
    images: [{ url: "...", alt: "..." }],
    videoUrl: "",
    videoThumbnail: ""
  }
]
```

---

## Keyboard Shortcuts (Future Enhancement)

```
Alt + Q    → Open Quick Add dialog
Esc        → Close any dialog
Ctrl + A   → Select all variants
Enter      → Save inline edit
↑↓         → Navigate between rows
```

---

## Validation Rules

✅ **Per Variant:**
- Color: Required
- Size: Required
- SKU: Required, unique
- Price: Required, > 0
- Stock: Required, >= 0
- Images: At least 1

✅ **All Variants:**
- No duplicate color-size combinations
- At least 1 variant

✅ **Form Submission:**
- All above rules must pass before submit

---

## Error Handling

| Error | Solution |
|-------|----------|
| "All combinations already exist" | Choose different colors/sizes |
| "Please select at least one color and size" | Use Quick Add properly |
| "Duplicate color-size combination" | Shown in preview with strikethrough |
| Missing images on variant | Shown as red % progress circle |
| Invalid price/stock | Inline validation when saving |

---

## Comparison: Old vs New

| Feature | Old System | New TikTok Style |
|---------|-----------|-----------------|
| **Add variant** | Click button, form appears | Quick Add dialog (2 clicks) |
| **Create grid** | One-by-one, tedious | Bulk: 5 colors × 4 sizes = 20 (1 dialog) |
| **Edit fields** | Separate form per variant | Inline edit in table |
| **Bulk ops** | None | Select multiple + template |
| **Images** | Full page per variant | Modal dialog, quick upload |
| **Visual feedback** | Basic | Color swatches, % progress, stats |
| **Mobile** | Poor scrolling | Optimized grid layout |
| **Time to complete** | 20-30 min (20 variants) | 5-10 min (20 variants) |

---

## Files

| File | Purpose |
|------|---------|
| `VariantsTikTokStyle.tsx` | Main wrapper component |
| `VariantsQuickAdd.tsx` | Quick add dialog |
| `VariantsGridManager.tsx` | Table/grid view |

---

## Implementation Checklist

- [ ] Copy 3 component files to `src/components/seller/`
- [ ] Import `VariantsTikTokStyle` in product form
- [ ] Replace old variants section with new component
- [ ] Remove old handler functions
- [ ] Test Quick Add dialog
- [ ] Test inline editing
- [ ] Test bulk selection & template
- [ ] Test form submission
- [ ] Test mobile view
- [ ] Test image upload modal

---

## Next Steps (Phase 2)

- [ ] Drag-and-drop reordering
- [ ] Keyboard shortcuts
- [ ] Bulk image upload
- [ ] CSV import/export
- [ ] Variant presets
- [ ] A/B testing (price variants)
- [ ] Analytics (which combos sell)

---

Last Updated: 2026-06-20
