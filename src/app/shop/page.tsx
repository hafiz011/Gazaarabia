import ProductCard from "@/components/ProductCard";

const products = [
    {
        id: 1,
        title: "Floral Maxi Dress",
        price: "₹4,999",
        label: "New In",
        images: [
            "/images/shop/img1-1.jpg",
            "/images/shop/img1-2.jpg",
            "/images/shop/img1-3.jpg",
            "/images/shop/img1-4.jpg",
        ],
        colors: ["#000000", "#E82C3F", "#009639", "#B899D2"],
    },
    {
        id: 2,
        title: "Abaya Gown",
        price: "₹6,499",
        images: [
            "/images/shop/img2-1.jpg",
            "/images/shop/img2-2.jpg",
            "/images/shop/img2-3.jpg",
            "/images/shop/img2-4.jpg",
        ],
        colors: ["#ffffff", "#B0C8ED", "#F9C9D6"],
    },
    {
        id: 3,
        title: "Modest Kaftan",
        price: "₹5,499",
        label: "New In",
        images: [
            "/images/shop/img3-1.jpg",
            "/images/shop/img3-2.jpg",
            "/images/shop/img3-3.jpg",
        ],
        colors: ["#E82C3F", "#009639"],
    },
];

export default function ShopPage() {
    return (
        <section className="bg-[var(--background)] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-wide capitalize">
                        Shop Dresses
                    </h1>
                    <p className="text-[var(--text-muted)] mt-2 max-w-2xl mx-auto text-sm md:text-base">
                        Explore our dress collection crafted for elegance and comfort.
                    </p>
                </div>

                {/* ✅ Grid matches Swiper slide width */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
}
