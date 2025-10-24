"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Trash2,
    Lock,
    ArrowLeft,
    X,
    ShoppingBag,
    Smile,
} from "lucide-react";
import { Button, Select, MenuItem, Divider } from "@mui/material";
import { useSession } from "next-auth/react";
import { cartService } from "@/lib/services/front-end/cartService";
import Loader from "@/components/Loader";

interface MatchingProduct {
    id: number;
    name: string;
    image: string;
    price: number;
    oldPrice?: number;
}

export default function CartPage() {
    const { data: session } = useSession();
    const token = session?.user?.token || null;

    const [cartItems, setCartItems] = useState<any[]>([]);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [quantityList] = useState<number[]>(Array.from({ length: 30 }, (_, i) => i + 1));

    // 🧭 Fetch Cart Items
    const fetchCart = async () => {
        if (!token) {
            setCartItems([]);
            setSubtotal(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await cartService.getAll(token);
            setCartItems(data.cart || []);
            setSubtotal(data.subtotal || 0);
        } catch (err) {
            console.error("❌ Failed to load cart", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [token]);

    // ✏️ Update Quantity
    const handleQuantity = async (productId: number, value: number) => {
        if (!token) return;

        setCartItems((prev) =>
            prev.map((item) =>
                item.productId === productId ? { ...item, quantity: value } : item
            )
        );

        try {
            const res = await cartService.updateQuantity(token, productId, value);
            if (res.subtotal !== undefined) setSubtotal(res.subtotal);
        } catch (err) {
            console.error("❌ Failed to update quantity", err);
            fetchCart();
        }
    };

    // 🗑 Remove Product
    const handleRemove = async (productId: number) => {
        if (!token) return;

        try {
            const res = await cartService.remove(token, productId);
            setCartItems((prev) => prev.filter((i) => i.productId !== productId));
            if (res.subtotal !== undefined) setSubtotal(res.subtotal);
        } catch (err) {
            console.error("❌ Failed to remove item", err);
        }
    };

    const checkoutButtonStyle = {
        borderColor: "var(--brand-secondary)",
        color: "var(--white)",
        backgroundColor: "var(--brand-secondary)",
        borderRadius: "9999px",
        padding: "8px 0",
        fontSize: "15px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "var(--brand-primary)",
            color: "white",
            borderColor: "var(--brand-primary)",
        },
    };

    // 📦 Static matching products
    const matchingProducts: MatchingProduct[] = [
        {
            id: 101,
            name: "Jacquard Abaya Black",
            image: "/images/shop/img2-1.jpg",
            price: 89,
        },
        {
            id: 102,
            name: "Sarwa Kaftan",
            image: "/images/shop/img2-2.jpg",
            price: 99,
        },
        {
            id: 103,
            name: "Fringed Open Abaya - Final Sale",
            image: "/images/shop/img2-4.jpg",
            price: 34.5,
            oldPrice: 69,
        },
    ];

    // 🛍 Empty Cart State
    // if (cartItems.length === 0) {
    //     return (
    //         <section className="max-w-[800px] mx-auto text-center py-20 px-4 flex flex-col items-center justify-center">
    //             <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--soft-gray)] mb-6">
    //                 <ShoppingBag size={40} className="text-[var(--brand-primary)]" />
    //             </div>

    //             <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)] flex items-center justify-center gap-2">
    //                 Your Cart is Empty
    //                 <Smile size={24} className="text-[var(--brand-primary)]" />
    //             </h2>

    //             <p className="text-[var(--text-muted)] mb-8 text-sm">
    //                 Browse products and add them to your bag.
    //             </p>

    //             <Link
    //                 href="/"
    //                 className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[var(--brand-primary)] px-6 py-3 rounded-full hover:bg-[var(--brand-secondary)] transition"
    //             >
    //                 <ArrowLeft size={16} />
    //                 Continue Shopping
    //             </Link>
    //         </section>
    //     );
    // }

    return (
        <>

            {loading ? <Loader /> :

                cartItems.length === 0 ?
                    <section className="max-w-[800px] mx-auto text-center py-20 px-4 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-[var(--soft-gray)] mb-6">
                            <ShoppingBag size={40} className="text-[var(--brand-primary)]" />
                        </div>

                        <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)] flex items-center justify-center gap-2">
                            Your Cart is Empty
                            <Smile size={24} className="text-[var(--brand-primary)]" />
                        </h2>

                        <p className="text-[var(--text-muted)] mb-8 text-sm">
                            Browse products and add them to your bag.
                        </p>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[var(--brand-primary)] px-6 py-3 rounded-full hover:bg-[var(--brand-secondary)] transition"
                        >
                            <ArrowLeft size={16} />
                            Continue Shopping
                        </Link>
                    </section>
                    :

                    <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 bg-[var(--soft-gray)]/20 min-h-screen">
                        <h1 className="text-3xl font-semibold text-[var(--text-primary)] mt-5 mb-8 tracking-tight uppercase text-center lg:text-left">
                            Shopping Bag
                        </h1>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            {/* 🛒 Cart Items */}
                            <div className="lg:col-span-2 space-y-10">
                                {cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-[var(--soft-gray)] bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {/* 🖼 Product Image */}
                                            <div className="relative w-full sm:w-40 aspect-square rounded-lg overflow-hidden border border-[var(--soft-gray)] bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
                                                <Image
                                                    src={
                                                        item.product.productimage[0]?.url ||
                                                        "/images/placeholder.png"
                                                    }
                                                    alt={item.product.title}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>

                                            {/* 📝 Product Details */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                    <h3 className="font-semibold text-[var(--text-primary)] text-lg leading-snug">
                                                        {item.product.title}
                                                    </h3>
                                                    <div className="text-[var(--brand-primary)] font-bold text-lg tracking-wide">
                                                        £{(item.product.sellingPrice * item.quantity).toFixed(2)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 mt-4">
                                                    <Select
                                                        size="small"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            handleQuantity(item.productId, Number(e.target.value))
                                                        }
                                                        sx={{
                                                            minWidth: 60,
                                                            "& .MuiOutlinedInput-notchedOutline": {
                                                                borderColor: "var(--soft-gray)",
                                                            },
                                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                                borderColor: "var(--brand-primary)",
                                                            },
                                                        }}
                                                    >
                                                        {quantityList.map((n) => (
                                                            <MenuItem key={n} value={n}>
                                                                {n}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>

                                                    {/* 🗑 Trash Button */}
                                                    <button
                                                        onClick={() => handleRemove(item.productId)}
                                                        className="p-2 rounded-full bg-[var(--soft-gray)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 🧢 Matching Products Section (Static) */}
                                        <div className="mt-6 border-t border-[var(--soft-gray)] pt-5">
                                            <p className="uppercase text-xs font-semibold text-[var(--text-muted)] mb-4 tracking-wide">
                                                Add Matching Product
                                            </p>
                                            <div className="space-y-3">
                                                {matchingProducts.map((mp) => (
                                                    <div key={mp.id} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-12 h-16 rounded-md overflow-hidden border border-[var(--soft-gray)]">
                                                                <Image
                                                                    src={mp.image}
                                                                    alt={mp.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                                                                    {mp.name}
                                                                </p>
                                                                <div className="text-sm font-semibold text-[var(--brand-primary)] flex items-center gap-2">
                                                                    £{mp.price.toFixed(2)}
                                                                    {mp.oldPrice && (
                                                                        <span className="line-through text-[var(--text-muted)] text-xs">
                                                                            £{mp.oldPrice.toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button className="text-xs font-medium border border-[var(--brand-primary)] text-[var(--brand-primary)] px-4 py-1.5 rounded-full hover:bg-[var(--brand-primary)] hover:text-white transition">
                                                            Add
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 📊 Order Summary */}
                            <div className="lg:pl-8 lg:sticky lg:top-24 h-fit rounded-2xl border border-[var(--soft-gray)] bg-white p-7 shadow-md">
                                <h2 className="text-lg font-semibold mb-5 text-[var(--text-primary)] uppercase tracking-wide">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 text-[var(--text-primary)] mb-6">
                                    {cartItems.map((i) => (
                                        <div key={i.productId} className="flex justify-between text-sm">
                                            <span className="inline-flex items-center gap-1 max-w-[220px]">
                                                <span className="font-medium">{i.quantity}</span>
                                                <X
                                                    size={12}
                                                    className="text-[var(--text-muted)] shrink-0 mt-[1px]"
                                                />
                                                <span
                                                    className="line-clamp-2 break-words text-[var(--text-primary)] leading-snug"
                                                    title={i.product.title}
                                                >
                                                    {i.product.title}
                                                </span>
                                            </span>

                                            <span className="font-medium">
                                                £{(i.product.sellingPrice * i.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}

                                    <Divider />

                                    <div className="flex justify-between font-bold pt-3 text-lg text-[var(--brand-primary)]">
                                        <span>Subtotal</span>
                                        <span>£{subtotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-xs text-center text-[var(--text-muted)] py-3 bg-[var(--soft-gray)]/50 rounded-lg">
                                        Spend £45.00 more for{" "}
                                        <span className="text-[var(--brand-primary)] font-medium">
                                            FREE SHIPPING
                                        </span>
                                    </p>
                                </div>

                                <Button fullWidth variant="outlined" sx={checkoutButtonStyle}>
                                    Proceed to Checkout
                                </Button>

                                <div className="mt-4 text-xs text-[var(--text-muted)] text-center flex items-center justify-center gap-2">
                                    <Lock size={12} /> Secure Checkout — All payments are safe
                                </div>

                                <div className="mt-6 text-center">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] underline hover:text-[var(--brand-primary)] transition"
                                    >
                                        <ArrowLeft size={16} />
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>


                        </div>
                    </section>

            }
        </>

    );
}
