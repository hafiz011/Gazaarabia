# Variant Management - Quick Reference

## 🚀 Setup (5 minutes)

### 1. Import & Use Hook
```tsx
import { useVariantManagement, ProductVariant } from "@/hooks/useVariantManagement";

const { variants, addVariant, updateVariant, removeVariant } = useVariantManagement({
  initialVariants: [],
  onError: (msg) => console.error(msg)
});
```

### 2. Use Component
```tsx
import { VariantsManager } from "@/components/seller/VariantsManager";

<VariantsManager
  variants={variants}
  onVariantsChange={setVariants}
  colors={colors}
  sizes={sizes}
  basePrice={form.sellingPrice}
/>
```

---

## 📋 Common Tasks

### Add Single Variant
```ts
addVariant({}, basePrice);
```

### Update Variant Field
```ts
updateVariant(index, "colorId", "red-001");
// Auto-validates for duplicates
```

### Copy Variant
```ts
copyVariant(0); // Full copy with new id
copyVariant(0, { clearColor: true }); // Keep size, new color
```

### Copy to All Sizes (Same Color)
```ts
const allSizes = sizes.map(s => s.id);
copyVariantToAllSizes(0, allSizes);
```

### Copy to All Colors (Same Size)
```ts
const allColors = colors.map(c => c.id);
copyVariantToAllColors(0, allColors);
```

### Remove Variant
```ts
removeVariant(index);
```

### Get Variants by Color
```ts
const redVariants = getVariantsByColor("red-001");
// Returns all variants with red color
```

### Get Variants by Size
```ts
const smallVariants = getVariantsBySize("size-s");
// Returns all variants with size S
```

### Validate Before Submit
```ts
const { isValid, errors } = validateVariants();
if (!isValid) {
  errors.forEach(err => showError(err));
}
```

### Build API Payload
```ts
import { buildVariantPayload } from "@/lib/variantUtils";

const payload = {
  variants: variants.map(v => buildVariantPayload(v))
};
```

---

## ⚠️ Common Pitfalls

### ❌ Don't Manually Create Variants
```ts
// Wrong - no validation
setVariants([...variants, { colorId: "", sizeId: "" }]);
```

### ✅ Do Use Hook Methods
```ts
// Right - validates & checks for duplicates
addVariant({}, basePrice);
```

### ❌ Don't Mix State Updates
```ts
// Wrong - parent and hook out of sync
setVariants([...]);
variants.push(...);
```

### ✅ Do Use Callback
```ts
// Right - single source of truth
onVariantsChange(variants);
```

### ❌ Don't Forget Images
```ts
// Missing images - will fail validation
{ colorId: "red", sizeId: "m", images: [] }
```

### ✅ Always Include Images
```ts
// Images required
{ colorId: "red", sizeId: "m", images: [{ url: "..." }] }
```

---

## 🎯 Workflows

### Workflow 1: Single Color, All Sizes
1. Create variant: Color=Red, Size=S
2. Upload 5 images
3. Fill SKU, price, stock
4. Click "Copy to All Sizes"
5. ✅ Creates Red-M, Red-L, Red-XL with copied images
6. User updates size-specific fields

### Workflow 2: Single Size, All Colors
1. Create variant: Size=M, Color=Red
2. Upload 5 images
3. Fill SKU, price, stock
4. Click "Copy to All Colors"
5. ✅ Creates M-Blue, M-Green, M-Black with copied images
6. User updates color-specific fields

### Workflow 3: Complete Grid
1. Click "Bulk Add"
2. Select: 3 colors (Red, Blue, Green)
3. Select: 4 sizes (XS, S, M, L)
4. ✅ Creates 12 variants (3×4)
5. Fill SKU, price, stock for each
6. Upload images per variant (or share)

### Workflow 4: Share Images Across Sizes
1. Red-S variant has 5 images ✓
2. Create Red-M (empty images)
3. Want same images for all red sizes
4. Use utility: `shareImagesAcrossSizes(variants, "red", images)`
5. ✅ All red variants now have these images

---

## 🔍 Validation Checklist

Before submitting, ensure:

- [ ] At least 1 variant exists
- [ ] Each variant has:
  - [ ] Color selected
  - [ ] Size selected
  - [ ] SKU filled
  - [ ] Price > 0
  - [ ] Stock >= 0
  - [ ] At least 1 image
- [ ] No duplicate color-size combinations
- [ ] All variants are valid: `validateVariants().isValid === true`

---

## 📊 Data Structure

### Single Variant
```ts
{
  id: 123,                    // Only in edit mode
  colorId: "color-001",       // Required
  sizeId: "size-s",           // Required
  sku: "RED-S-001",           // Required, unique
  price: 29.99,               // Required, > 0
  stock: 100,                 // Required, >= 0
  isActive: true,             // Default true
  images: [                   // Required, >= 1
    { url: "...", alt: "...", isPrimary: true },
    { url: "...", alt: "..." }
  ],
  videoUrl: "https://...",    // Optional
  videoThumbnail: "..."       // Optional
}
```

### API Submit
```ts
// Send to /api/products or /api/products/:id
{
  title: "Product Name",
  variants: [
    {
      colorId: 123,
      sizeId: 456,
      sku: "RED-S-001",
      price: 29.99,
      stock: 100,
      isActive: true,
      images: [{ url: "...", alt: "..." }],
      videoUrl: "",
      videoThumbnail: ""
    }
  ]
}
```

---

## 🆘 Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Duplicate color-size combination" | Trying to add red+M when it exists | Choose different color/size |
| "Color is required" | Variant missing colorId | Select a color |
| "Size is required" | Variant missing sizeId | Select a size |
| "At least one image is required" | No images uploaded | Upload images |
| "Price must be greater than 0" | Price = 0 or negative | Set price > 0 |
| "Stock cannot be negative" | Stock < 0 | Set stock >= 0 |
| "No variants created" | variants.length === 0 | Click "Add New Variant" |

---

## 📝 Files Created

| File | Purpose |
|------|---------|
| `src/hooks/useVariantManagement.ts` | Core hook for variant operations |
| `src/lib/variantUtils.ts` | Helper functions & validation |
| `src/components/seller/VariantCardV2.tsx` | Enhanced variant UI card |
| `src/components/seller/VariantsManager.tsx` | Main manager component |
| `VARIANT_MANAGEMENT_GUIDE.md` | Full documentation |
| `VARIANT_IMPLEMENTATION_EXAMPLE.tsx` | How to integrate |
| `VARIANT_QUICK_REFERENCE.md` | This file |

---

## 🔗 Integration Steps

1. ✅ Copy 4 files to project:
   - `useVariantManagement.ts` → `src/hooks/`
   - `variantUtils.ts` → `src/lib/`
   - `VariantCardV2.tsx` → `src/components/seller/`
   - `VariantsManager.tsx` → `src/components/seller/`

2. ✅ Update ProductForm:
   ```tsx
   import { VariantsManager } from "@/components/seller/VariantsManager";
   
   <VariantsManager
     variants={variants}
     onVariantsChange={setVariants}
     colors={colors}
     sizes={sizes}
     basePrice={form.sellingPrice}
   />
   ```

3. ✅ Update submit payload:
   ```tsx
   import { buildVariantPayload } from "@/lib/variantUtils";
   
   variants: variants.map(v => buildVariantPayload(v))
   ```

4. ✅ Remove old variant handlers:
   - Delete `handleVariantAdd()`
   - Delete `handleVariantChange()`
   - Delete `handleVariantRemove()`
   - Delete `handleVariantCopy()`

5. ✅ Test workflows above

---

## 💡 Pro Tips

- **Bulk Add First**: Create all color-size combos at once, then fill details
- **Copy Template**: Create one perfect variant, copy it, adjust
- **Share Images**: Use utilities to avoid re-uploading same images
- **Validate Early**: Check `validateVariants()` before showing submit button
- **Error Callbacks**: Set `onError` to display to user immediately
- **Group by Color**: Use `getVariantsByColorGroup()` for reporting/stats
- **Group by Size**: Use `getVariantsBySizeGroup()` for inventory checks

---

## 🧪 Test Cases

```ts
// Test 1: Add variant
addVariant();
expect(variants.length).toBe(1);

// Test 2: Duplicate detection
addVariant({ colorId: "red", sizeId: "m" });
const result = updateVariant(1, "colorId", "red");
// Should fail or show warning

// Test 3: Copy to all
copyVariantToAllSizes(0, ["s", "m", "l"]);
expect(variants.length).toBe(3);

// Test 4: Validate empty
const { isValid } = validateVariants();
// Should be false

// Test 5: Query by color
const redOnes = getVariantsByColor("red");
expect(redOnes.every(v => v.colorId === "red")).toBe(true);
```

---

Last Updated: 2026-06-20
