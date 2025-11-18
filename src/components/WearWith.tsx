"use client";

import SingleImgMultiColorProductCard from "./SingleImgMultiColorsProductCard";

export default function WearWith() {
    const wearWithProducts = [
        { id: 1, img: "/images/shop/img2-1.jpg", title: "Hooded1 Abaya Black", price: "£5,499" },
        { id: 2, img: "/images/shop/img2-2.jpg", title: "Mara Coat Black", price: "£4,999" },
        { id: 3, img: "/images/shop/img2-3.jpg", title: "Black Jersey Hijab", price: "£799" },
        { id: 4, img: "/images/shop/img2-4.jpg", title: "Crossover Hijab Cap", price: "£699" },
        { id: 5, img: "/images/shop/img2-5.jpg", title: "Matte Black Pin Set", price: "£299" },
    ];

    return (
        <section className="max-w-[1600px] mx-auto px-4 py-16 border-t">
            <h2 className="text-2xl font-semibold mb-8 text-[var(--text-primary)] tracking-tight">
                Wear With
            </h2>

            {/* <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {wearWithProducts.map((item, i) => (
                    <div
                        key={i}
                        className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
                    >
                        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-[var(--brand-secondary)]">
                            <img
                                src={item.img}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="mt-4 text-sm font-medium text-[var(--text-primary)] line-clamp-2">
                            {item.title}
                        </h3>
                        <p className="mt-1 text-[var(--brand-primary)] text-sm font-semibold">
                            {item.price}
                        </p>
                        <button className="mt-3 text-xs font-medium border border-[var(--brand-secondary)] text-[var(--brand-secondary)] rounded-full py-2 hover:bg-[var(--brand-secondary)] hover:text-white transition">
                            Add to Bag
                        </button>
                    </div>
                ))}
            </div> */}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {wearWithProducts.map((item, index) => (
                    <SingleImgMultiColorProductCard
                        key={index}
                        product={item}
                        removable
                    //   onRemove={handleRemove}
                    //   onAddToBag={handleAddToBag}
                    //   onToggleWishlist={handleWishlistToggle}
                    />
                ))}
            </div>


        </section>
    );
}
