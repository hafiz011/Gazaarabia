// /src/services/cartMergeService.ts
import { localCartService } from "./localCartService";
import { cartService } from "./cartService";

/**
 * Merge guest cart (localStorage) into logged-in user's cart
 * Call this right after successful login
 */
export async function mergeLocalCartWithServer(token: string) {
  try {
    const localCartData = localCartService.get();
    const localCart = localCartData?.cart || []
    console.log('localCart:>',localCart)
    if (!localCart || localCart.length === 0) return;

    for (const item of localCart) {
      console.log('item:>',item)
      await cartService.add(
        token,
        item.productId,
        item.quantity,
        item.variantId,
        item.colorId,
        item.sizeId
      );
    }

    //  clear guest cart after merging
    localCartService.clear();
    console.log("Local cart merged successfully");
  } catch (err) {
    console.error("Failed to merge local cart:", err);
  }
}
