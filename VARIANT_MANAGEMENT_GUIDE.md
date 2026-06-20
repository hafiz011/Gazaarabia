# Product Variants Management System

## Overview

A comprehensive variant management system for handling color, size, and image combinations in the product form.

## Features

### 1. **Same Size, Multiple Colors with Images**
- Add the same size in different colors
- Each color variant can have unique images
- Bulk add all colors for a size using `copyVariantToAllColors()`

**Example:**
```
Size: M (Medium)
├── Red - 5 images
├── Blue - 5 images
└── Green - 5 images
```

### 2. **Same Color, Multiple Sizes with Images**
- Add the same color in different sizes
- Each size variant can have unique images
- Bulk add all sizes for a color using `copyVariantToAllSizes()`

**Example:**
```
Color: Red
├── S (Small) - 5 images
├── M (Medium) - 5 images
└── L (Large) - 5 images
```

### 3. **Bulk Operations**
- **Bulk Add**: Create multiple variants at once by selecting colors & sizes
- **Copy to All Sizes**: From one color, auto-create all sizes
- **Copy to All Colors**: From one size, auto-create all colors
- **Copy Variant**: Single variant duplication with empty SKU

---

## Usage

### Basic Integration in Product Form

```tsx
"use client";

import { useState } from "react";
import { useVariantManagement } from "@/hooks/useVariantManagement";
import { VariantsManager } from "@/components/seller/VariantsManager";

function ProductForm() {
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);

  return (
    <div>
      <VariantsManager
        variants={variants}
        onVariantsChange={setVariants}
        colors={colors}
        sizes={sizes}
        basePrice={form.sellingPrice}
        onError={(msg) => setAlertMessage({ isOpen: true, type: "error", message: msg })}
      />
    </div>
  );
}
```

---

## Hook: `useVariantManagement`

### Core Methods

#### `addVariant(variant?, basePrice?)`
Create a new blank variant.
```ts
const { addVariant } = useVariantManagement();
addVariant({}, basePrice); // Returns variant count
```

#### `updateVariant(index, field, value)`
Update a variant field with duplicate checking.
```ts
updateVariant(0, "colorId", "red-001"); // Returns boolean
```

#### `copyVariant(index, options?)`
Copy variant with optional field clearing.
```ts
copyVariant(0); // Basic copy
copyVariant(0, { clearColor: true }); // Keep size, clear color
```

#### `copyVariantToAllSizes(index, sizeIds)`
Copy color variant to all available sizes.
```ts
const allSizeIds = sizes.map(s => s.id);
copyVariantToAllSizes(0, allSizeIds);
```

#### `copyVariantToAllColors(index, colorIds)`
Copy size variant to all available colors.
```ts
const allColorIds = colors.map(c => c.id);
copyVariantToAllColors(0, allColorIds);
```

### Query Methods

#### `getVariantsByColor(colorId)`
Get all variants with a specific color (any size).
```ts
const redVariants = getVariantsByColor("red-001");
// Returns: [{ colorId: "red-001", sizeId: "S", ... }, ...]
```

#### `getVariantsBySize(sizeId)`
Get all variants with a specific size (any color).
```ts
const smallVariants = getVariantsBySize("size-s");
```

#### `getVariantsByColorGroup()`
Group all variants by color.
```ts
const grouped = getVariantsByColorGroup();
// Returns: { "red-001": [...], "blue-001": [...] }
```

#### `getVariantsBySizeGroup()`
Group all variants by size.
```ts
const grouped = getVariantsBySizeGroup();
// Returns: { "size-s": [...], "size-m": [...] }
```

#### `isDuplicateCombination(colorId, sizeId, excludeIndex?)`
Check if color-size combination already exists.
```ts
if (isDuplicateCombination("red-001", "size-m")) {
  // Show error
}
```

#### `validateVariants()`
Validate all variants for submission.
```ts
const { isValid, errors } = validateVariants();
if (!isValid) {
  errors.forEach(err => console.error(err));
}
```

---

## Utilities: `variantUtils.ts`

### Validation Functions

#### `isValidVariantCombination(variants, colorId, sizeId)`
```ts
if (isValidVariantCombination(variants, "red-001", "size-m")) {
  // Safe to add
}
```

#### `validateVariantData(variant)`
Validate single variant before submit.
```ts
const { isValid, errors } = validateVariantData(variant);
```

### Combination Functions

#### `getMissingCombinations(variants, colors, sizes)`
Find all missing color-size combinations.
```ts
const missing = getMissingCombinations(variants, colors, sizes);
// Shows which combinations are empty
```

#### `getColorSizeCombinations(variants)`
Get all existing combinations as array.
```ts
const combos = getColorSizeCombinations(variants);
// Returns: [{ colorId, sizeId, key }, ...]
```

### Bulk Operation Functions

#### `applyTemplateToSizes(variants, templateIndex, targetSizes)`
Expand a color template to multiple sizes.
```ts
const expanded = applyTemplateToSizes(
  variants,
  0, // Template variant index
  ["size-s", "size-m", "size-l"] // Target sizes
);
```

#### `applyTemplateToColors(variants, templateIndex, targetColors)`
Expand a size template to multiple colors.
```ts
const expanded = applyTemplateToColors(
  variants,
  0,
  ["red-001", "blue-001", "green-001"]
);
```

### Image Sharing Functions

#### `shareImagesAcrossSizes(variants, colorId, images)`
Add same images to all sizes of a color (no duplicates).
```ts
const updated = shareImagesAcrossSizes(
  variants,
  "red-001",
  [{ url: "img1.jpg" }, { url: "img2.jpg" }]
);
```

#### `shareImagesAcrossColors(variants, sizeId, images)`
Add same images to all colors of a size (no duplicates).
```ts
const updated = shareImagesAcrossColors(
  variants,
  "size-m",
  [{ url: "img1.jpg" }]
);
```

---

## Component: `VariantsManager`

Main UI component that manages all variant operations with a clean interface.

### Props

```ts
interface VariantsManagerProps {
  variants: ProductVariant[];           // Current variants
  onVariantsChange: (variants) => void; // Update parent state
  colors: any[];                         // Available colors
  sizes: any[];                          // Available sizes
  basePrice?: string | number;           // Auto-fill price
  onError?: (message: string) => void;  // Error callback
}
```

### Features

- **Duplicate Detection**: Highlights duplicate color-size combinations in red
- **Missing Combinations**: Shows warning if combos are missing
- **Bulk Add Dialog**: Select multiple colors & sizes to create at once
- **Copy Actions**: 
  - Copy single variant
  - Copy to all sizes (for a color)
  - Copy to all colors (for a size)
- **Image Management**: Per-variant image upload with labels

### Example

```tsx
<VariantsManager
  variants={variants}
  onVariantsChange={setVariants}
  colors={availableColors}
  sizes={availableSizes}
  basePrice={form.sellingPrice}
  onError={handleError}
/>
```

---

## Component: `VariantCardV2`

Enhanced variant card with improved UI/UX.

### Features

- **Color & Size Chips**: Visual display of variant's color/size
- **Duplicate Warning**: Red border and error message for duplicates
- **Copy Actions**: Buttons to copy to all sizes or colors
- **Status Toggle**: Active/Inactive per variant
- **Better Image Labels**: Shows color-size combo in image uploader

### Props

```ts
interface VariantCardV2Props {
  variant: ProductVariant;
  index: number;
  colors: any[];
  sizes: any[];
  isDuplicate?: boolean;
  onVariantChange: (field, value) => void;
  onVariantRemove: () => void;
  onVariantCopy: () => void;
  onCopyToAllSizes?: () => void;
  onCopyToAllColors?: () => void;
  onError: (message: string) => void;
  autoFillPrice?: string | number;
}
```

---

## Data Structure

### ProductVariant
```ts
interface ProductVariant {
  id?: string | number;           // DB ID (edit mode)
  colorId: string | number;       // Required
  sizeId: string | number;        // Required
  sku: string;                    // Unique per variant
  price: string | number;         // Must be > 0
  stock: string | number;         // Must be >= 0
  isActive?: boolean;             // Default true
  images: VariantImage[];         // At least 1 required
  videoUrl?: string;              // Optional
  videoThumbnail?: string;        // Optional
}
```

### VariantImage
```ts
interface VariantImage {
  id?: string | number;
  url: string;                    // Required
  alt?: string;
  isPrimary?: boolean;            // First image default
}
```

---

## Validation Rules

### Per-Variant
- Color: Required
- Size: Required
- SKU: Required (unique)
- Price: Required, > 0
- Stock: Required, >= 0
- Images: At least 1

### All Variants
- No duplicate color-size combinations
- At least 1 variant required
- All required fields filled

---

## Common Scenarios

### Scenario 1: Same Size, Multiple Colors
1. User adds variant with Size=M, Color=Red
2. Uploads 5 images for red M
3. Clicks "Copy to All Colors"
4. System creates M-Blue, M-Green, etc.
5. User edits each to upload color-specific images

### Scenario 2: Complete Grid (All Colors × All Sizes)
1. User clicks "Bulk Add"
2. Selects 3 colors, 4 sizes
3. System creates 12 variants (3 × 4)
4. User fills in SKU, price, stock
5. Uploads images per variant (manual or copy)

### Scenario 3: Copy Template
1. User creates Red-M with full details + 5 images
2. Clicks "Copy to All Sizes"
3. System creates Red-S, Red-L, etc.
4. Images automatically copied (no duplicates)
5. User only updates SKU, price, stock per size

---

## API Payload

When submitting variants:

```ts
const payload = {
  variants: variants.map(v => ({
    colorId: v.colorId,
    sizeId: v.sizeId,
    sku: v.sku,
    price: parseFloat(v.price),
    stock: parseInt(v.stock),
    isActive: v.isActive !== false,
    images: v.images.map(img => ({
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary
    })),
    videoUrl: v.videoUrl || "",
    videoThumbnail: v.videoThumbnail || "",
    ...(v.id && { id: v.id }) // For updates
  }))
};
```

---

## Error Handling

All errors are surfaced through the `onError` callback:

```ts
onError?.("This color and size combination already exists.");
onError?.("At least one color is required.");
onError?.("Price must be greater than 0.");
```

These should be displayed to the user in an alert/toast.

---

## Performance Considerations

- **Memoized callbacks**: `useVariantManagement` uses `useCallback` for all methods
- **Duplicate checking**: O(n) per update; consider index for large variant counts (100+)
- **Image sharing**: Only adds new images; never duplicates
- **Bulk operations**: All happen in one state update

---

## Testing Checklist

- [ ] Add single variant
- [ ] Add duplicate color-size (should show error)
- [ ] Update color/size (validation works)
- [ ] Copy variant (clears ID & SKU)
- [ ] Copy to all sizes (creates N variants)
- [ ] Copy to all colors (creates N variants)
- [ ] Bulk add (creates N×M variants)
- [ ] Upload images per variant
- [ ] Remove variant
- [ ] Validate all (catches missing fields)
- [ ] Submit form (payload is correct)
