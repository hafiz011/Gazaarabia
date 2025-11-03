import { getLocalCartData } from "@/lib/helpers/localCartHelper";

const LOCAL_CART_KEY = process.env.LOCAL_CART_KEY || "gaza_arabia_guest_cart";

export const localCartService = {
  get() {
    if (typeof window === "undefined") return { cart: [], subtotal: 0 };
    const data = localStorage.getItem(LOCAL_CART_KEY);
    return data ? JSON.parse(data) : { cart: [], subtotal: 0 };
  },

  // save(cart: any[]) {
  //   console.log('inside the save')
  //   const subtotal = cart.reduce(
  //     (acc, item) => acc + (item.selectedVariantData?.price || 0) * item.quantity,
  //     0
  //   );
  //   const formatted = { cart, subtotal };
  //   localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(formatted));
  // },

  save(cart: any[]) {
  console.log("inside the save");

  //  Always prefer latest API-provided price
  const subtotal = cart.reduce((acc, item) => {
    const price =
      item.price ??
      item.selectedVariantData?.price ??
      item.product?.sellingPrice ??
      0;

    return acc + price * item.quantity;
  }, 0);

  const formatted = { cart, subtotal };
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(formatted));

  console.log("Cart saved to localStorage:", formatted);
}
,

  add(item: any) {
    if (typeof window === "undefined") return;

    const { cart } = this.get();

    // STEP 1: Get available stock for validation
    const availableStock =
      item.selectedVariantData?.availableStock ?? item.product?.availableStock ?? 0;

    // Prevent adding if out of stock
    if (availableStock <= 0) {
      console.warn("This item is out of stock.");
      return { success: false, error: "This item is out of stock." };
    }

    // Check if item already exists
    const existing = cart.find(
      (p: any) =>
        p.productId === item.productId &&
        p.variantId === item.variantId &&
        p.colorId === item.colorId &&
        p.sizeId === item.sizeId
    );

    if (existing) {

      // Calculate total quantity if this item already exists
      const newQty = existing.quantity + item.quantity;

      // Check if exceeds available stock
      if (newQty > availableStock) {
        console.warn(`Only ${availableStock} item(s) are available in stock.`);
        return {
          success: false,
          error: `Only ${availableStock} item(s) are available in stock.`,
        };
      }

      // Safe to update
      existing.quantity = newQty;
      existing.availableStock = availableStock;
      existing.product.availableStock = availableStock;
      existing.product.productimage = item.product.productimage || [],
      existing.selectedVariantData.availableStock = availableStock;
      existing.updatedAt = new Date().toISOString();

    } else {
      // STEP: Validate initial quantity against available stock
      if (item.quantity > availableStock) {
        console.warn(`Only ${availableStock} item(s) are available in stock.`);
        return {
          success: false,
          error: `Only ${availableStock} item(s) are available in stock.`,
        };
      }

      //  Add new item to cart
      cart.push({
        id: Date.now(),
        userId: null,
        productId: item.productId,
        colorId: item.colorId,
        sizeId: item.sizeId,
        variantId: item.variantId,
        quantity: item.quantity,
        availableStock,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        product: {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          availableStock,
          sellingPrice: item.product.sellingPrice,
          productimage: item.product.productimage || [],
        },
        selectedVariantData: {
          id: item.selectedVariantData.id,
          sizeId: item.selectedVariantData.sizeId,
          colorId: item.selectedVariantData.colorId,
          sizeName: item.selectedVariantData.sizeName,
          colorName: item.selectedVariantData.colorName,
          hexCode: item.selectedVariantData.hexCode,
          price: item.selectedVariantData.price,
          availableStock: item.selectedVariantData.availableStock,
          variantImages: item.selectedVariantData.variantImages || [],
        },
      });
    }


    this.save(cart);

    // Use new helper for subtotal + data
    const { cart: updatedCart, subtotal } = getLocalCartData();

    return {
      success: true,
      local: true,
      message: "Item added to cart successfully",
      subtotal,
      cart: updatedCart,
    };

  },



  updateQuantity(productId: number, variantId: number, quantity: number) {
    const { cart } = this.get();

    const item = cart.find(
      (p: any) => p.productId === productId && p.variantId === variantId
    );

    if (!item) {
      console.warn("Cart item not found.");
      return { success: false, error: "Cart item not found." };
    }

    const availableStock =
      item.selectedVariantData?.availableStock ??
      item.product?.availableStock ??
      0;

    if (availableStock <= 0) {
      return { success: false, error: "This item is out of stock." };
    }

    if (quantity > item.quantity && quantity > availableStock) {
      return {
        success: false,
        error: `Only ${availableStock} item(s) are available in stock.`,
      };
    }

    if (quantity < 1) quantity = 1;

    item.quantity = quantity;
    item.updatedAt = new Date().toISOString();

    this.save(cart);

    // Use new helper for subtotal + data
    const { cart: updatedCart, subtotal } = getLocalCartData();

    return {
      success: true,
      local: true,
      message: "Quantity updated successfully",
      subtotal,
      cart: updatedCart,
    };
  },

  remove(productId: number, variantId: number) {
    const { cart } = this.get();
    const filtered = cart.filter(
      (p: any) => !(p.productId === productId && p.variantId === variantId)
    );
    this.save(filtered);

    // Use new helper for subtotal + data
    const { cart: updatedCart, subtotal } = getLocalCartData();

    return {
      success: true,
      local: true,
      message: "Product removed from cart",
      subtotal,
      cart: updatedCart,
    };

  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LOCAL_CART_KEY);
  },
};
