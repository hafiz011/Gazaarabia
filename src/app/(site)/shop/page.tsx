import ShopByCategory from "@/components/home/shopByCategory";


interface PageProps {
  params: {
    submenu: string;
  };
}

async function getSubcategories(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/subcategories/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data?.data || [];
}

export default async function SubmenuPage({ params }: PageProps) {
  const categories = await getSubcategories(params.submenu);


  const dummySubcategories = [
  {
    id: 1,
    name: "Shirts",
    slug: "shirts",
    image: "/images/categories/shirts.jpg",
  },
  {
    id: 2,
    name: "T-Shirts",
    slug: "t-shirts",
    image: "/images/categories/tshirts.jpg",
  },
  {
    id: 3,
    name: "Jackets",
    slug: "jackets",
    image: "/images/categories/jackets.jpg",
  },
  {
    id: 4,
    name: "Hoodies",
    slug: "hoodies",
    image: "/images/categories/hoodies.jpg",
  },
  {
    id: 5,
    name: "Abayas",
    slug: "abayas",
    image: "/images/categories/abayas.jpg",
  },
  {
    id: 6,
    name: "Hijabs",
    slug: "hijabs",
    image: "/images/categories/hijabs.jpg",
  },
  {
    id: 7,
    name: "Modest Dresses",
    slug: "modest-dresses",
    image: "/images/categories/dresses.jpg",
  },
  {
    id: 8,
    name: "Accessories",
    slug: "accessories",
    image: "/images/categories/accessories.jpg",
  },
];

  return (
    <main className="mt-10 md:mt-[140px]">
      <ShopByCategory categories={dummySubcategories} />
    </main>
  );
}