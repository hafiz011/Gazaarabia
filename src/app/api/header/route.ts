// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma: any = new PrismaClient();

// //  Define frontend-ready return type
// interface HeaderMenu {
//   id: number;
//   name: string;
//   slug: string;
//   type: string;
//   dropdown?: {
//     left: { id?: number; name: string; slug: string; isCustom?: boolean }[];
//     right: { id?: number; name: string; slug: string; isCustom?: boolean }[];
//     banners: { image: string; title: string; link: string }[];
//   } | null;
// }

// export async function GET() {
//   try {
//     //  Fetch menus with submenus, categories, and subcategories
//     const menus = await prisma.menus.findMany({
//       include: {
//         submenus: {
//           include: {
//             category: {
//               include: { subcategories: true },
//             },
//           },
//           orderBy: [
//             { position: "asc" },
//             { id: "asc" }, // fallback
//           ],
//         },
//       },
//       orderBy: [
//         { position: "asc" },
//         { id: "asc" },
//       ],
//     });

//     // Preload subcategories for mapping
//     const allSubcategories = await prisma.subcategory.findMany({
//       select: { id: true, name: true, slug: true },
//     });

//     // 🔹 Helper: Convert subcategory IDs → objects
//     const getSubcategoryData = (
//       ids: unknown
//     ): { id: number; name: string; slug: string }[] => {
//       if (!Array.isArray(ids)) return [];
//       return ids
//         .map((id) => allSubcategories.find((s: any) => s.id === Number(id)))
//         .filter((s): s is { id: number; name: string; slug: string } => !!s);
//     };

//     // 🔹 Helper: Convert custom links → consistent structure
//     const getCustomLinks = (
//       links: unknown
//     ): { name: string; slug: string; isCustom: boolean }[] => {
//       if (!Array.isArray(links)) return [];
//       return (links as any[])
//         .filter((l) => l?.name && l?.slug)
//         .map((l) => ({
//           name: l.name,
//           slug: l.slug,
//           isCustom: true,
//         }));
//     };

//     //  Build structured response
//     const formatted: HeaderMenu[] = menus.map((menu: any) => {
//       const dropdown =
//         menu.type === "product" && menu.submenus.length > 0
//           ? {
//               // LEFT COLUMN → custom links always on top
//               left: [
//                 //  custom links first
//                 ...menu.submenus.flatMap((sub: any) =>
//                   getCustomLinks(sub.leftCustomLinks)
//                 ),
//                 // then subcategories (deduplicated)
//                 ...new Map(
//                   menu.submenus
//                     .flatMap((sub: any) =>
//                       getSubcategoryData(sub.leftSubcategories)
//                     )
//                     .map((obj: any) => [obj.id, obj])
//                 ).values(),
//               ],

//               // RIGHT COLUMN → custom links first
//               right: [
//                 ...menu.submenus.flatMap((sub: any) =>
//                   getCustomLinks(sub.rightCustomLinks)
//                 ),
//                 ...new Map(
//                   menu.submenus
//                     .flatMap((sub: any) =>
//                       getSubcategoryData(sub.rightSubcategories)
//                     )
//                     .map((obj: any) => [obj.id, obj])
//                 ).values(),
//               ],

//               //  Banners
//               banners:
//                 Array.isArray(menu.images) && menu.images.length > 0
//                   ? menu.images.map((img: string) => ({
//                       image: img,
//                       title: menu.name,
//                       link: `/${menu.slug}`,
//                     }))
//                   : [],
//             }
//           : null;

//       return {
//         id: menu.id,
//         name: menu.name,
//         slug: menu.slug,
//         type: menu.type,
//         dropdown,
//       };
//     });

//     return NextResponse.json({ success: true, data: formatted });
//   } catch (error) {
//     console.error(" Header API Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to load header data" },
//       { status: 500 }
//     );
//   }
// }


// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma: any = new PrismaClient();

interface HeaderMenu {
  id: number;
  name: string;
  slug: string;
  type: string;
  dropdown?: {
    left: { id?: number; name: string; slug: string; isCustom?: boolean }[];
    right: { id?: number; name: string; slug: string; isCustom?: boolean }[];
    banners: { image: string; title: string; link: string }[];
  } | null;
}

// export async function GET() {
//   try {
//     // ✅ Load all menus with submenus
//     const menus = await prisma.menus.findMany({
//       include: {
//         submenus: true,
//       },
//       orderBy: [
//         { position: "asc" },
//         { id: "asc" },
//       ],
//     });

//     // ✅ Load all possible reference data
//     const [allSubcategories, allBlogCategories] = await Promise.all([
//       prisma.subcategory.findMany({
//         select: { id: true, name: true, slug: true },
//       }),
//       prisma.blogCategories.findMany({
//         select: { id: true, name: true, slug: true },
//       }),
//     ]);

//     // 🔹 Utility: convert subcategory IDs → full objects
//     const getSubcategoryData = (ids: unknown) => {
//       if (!Array.isArray(ids)) return [];
//       return ids
//         .map((id) => allSubcategories.find((s: any) => s.id === Number(id)))
//         .filter(Boolean);
//     };

//     // 🔹 Utility: convert blog category IDs → full objects
//     const getBlogCategoryData = (ids: unknown) => {
//       if (!Array.isArray(ids)) return [];
//       return ids
//         .map((id) => allBlogCategories.find((b: any) => b.id === Number(id)))
//         .filter(Boolean);
//     };

//     // 🔹 Utility: convert custom link JSON → uniform format
//     const getCustomLinks = (links: unknown) => {
//       if (!Array.isArray(links)) return [];
//       return (links as any[])
//         .filter((l) => l?.name && l?.slug)
//         .map((l) => ({
//           name: l.name,
//           slug: l.slug,
//           isCustom: true,
//         }));
//     };

//     // ✅ Build final menu response
//     const formatted: HeaderMenu[] = menus.map((menu: any) => {
//       const isBlog = menu.type === "blog";
//       const isProduct = menu.type === "product";

//       if (menu.submenus.length === 0) {
//         return {
//           id: menu.id,
//           name: menu.name,
//           slug: menu.slug,
//           type: menu.type,
//           dropdown: null,
//         };
//       }

//       // Merge left/right side data
//       const leftMerged = [
//         // custom links first
//         ...menu.submenus.flatMap((s: any) => getCustomLinks(s.leftCustomLinks)),
//         // then categories/subcategories
//         ...(isProduct
//           ? new Map(
//               menu.submenus
//                 .flatMap((s: any) => getSubcategoryData(s.leftSubcategories))
//                 .map((obj: any) => [obj.id, obj])
//             ).values()
//           : new Map(
//               menu.submenus
//                 .flatMap((s: any) => getBlogCategoryData(s.leftSubcategories))
//                 .map((obj: any) => [obj.id, obj])
//             ).values()),
//       ];

//       const rightMerged = [
//         ...menu.submenus.flatMap((s: any) => getCustomLinks(s.rightCustomLinks)),
//         ...(isProduct
//           ? new Map(
//               menu.submenus
//                 .flatMap((s: any) => getSubcategoryData(s.rightSubcategories))
//                 .map((obj: any) => [obj.id, obj])
//             ).values()
//           : new Map(
//               menu.submenus
//                 .flatMap((s: any) => getBlogCategoryData(s.rightSubcategories))
//                 .map((obj: any) => [obj.id, obj])
//             ).values()),
//       ];

//       return {
//         id: menu.id,
//         name: menu.name,
//         slug: menu.slug,
//         type: menu.type,
//         dropdown: {
//           left: Array.from(leftMerged),
//           right: Array.from(rightMerged),
//           banners:
//             Array.isArray(menu.images) && menu.images.length > 0
//               ? menu.images.map((img: string) => ({
//                   image: img,
//                   title: menu.name,
//                   link:
//                     menu.type === "blog"
//                       ? "/blogs/journal"
//                       : `/shop/${menu.slug}`,
//                 }))
//               : [],
//         },
//       };
//     });

//     return NextResponse.json({ success: true, data: formatted });
//   } catch (error) {
//     console.error("❌ Header API Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to load header data" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function GET() {
  try {
    // ✅ Fetch menus and their submenus
    const menus = await prisma.menus.findMany({
      include: { submenus: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    // ✅ Fetch all related data
    const [allSubcategories, allBlogCategories] = await Promise.all([
      prisma.subcategory.findMany({
        select: { id: true, name: true, slug: true },
      }),
      prisma.blogCategories.findMany({
        select: { id: true, name: true, slug: true },
      }),
    ]);

    // ✅ Utility: Safe JSON parsing
    const parseJSON = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    // ✅ Custom Links Parser — allow empty slug
    const getCustomLinks = (links: any) => {
      const parsed = parseJSON(links);
      return parsed
        .filter((l: any) => l?.name) // allow empty slug
        .map((l: any) => ({
          name: l.name,
          slug: l.slug || "", // default empty string
          isCustom: true,
        }));
    };

    // ✅ Subcategory Mapper (Product Menus)
    const getSubcategoryData = (ids: any) => {
      const parsed = parseJSON(ids);
      return parsed
        .map((id: number) => allSubcategories.find((s: any) => s.id === Number(id)))
        .filter(Boolean);
    };

    // ✅ Blog Category Mapper (Blog Menus)
    const getBlogCategoryData = (ids: any) => {
      const parsed = parseJSON(ids);
      return parsed
        .map((id: number) => allBlogCategories.find((b: any) => b.id === Number(id)))
        .filter(Boolean);
    };

    // ✅ Build final structured response
    const formatted = menus.map((menu: any) => {
      const isBlog = menu.type === "blog";
      const isProduct = menu.type === "product";

      if (!menu.submenus?.length) {
        return {
          id: menu.id,
          name: menu.name,
          slug: menu.slug,
          type: menu.type,
          dropdown: null,
        };
      }

      // Merge Left Column
      const leftMerged = [
        // Custom links always first
        ...menu.submenus.flatMap((s: any) => getCustomLinks(s.leftCustomLinks)),

        // Product subcategories or blog categories
        ...(isProduct
          ? new Map(
              menu.submenus
                .flatMap((s: any) => getSubcategoryData(s.leftSubcategories))
                .map((obj: any) => [obj.id, obj])
            ).values()
          : new Map(
              menu.submenus
                .flatMap((s: any) => getBlogCategoryData(s.leftSubcategories))
                .map((obj: any) => [obj.id, obj])
            ).values()),
      ];

      // Merge Right Column
      const rightMerged = [
        ...menu.submenus.flatMap((s: any) => getCustomLinks(s.rightCustomLinks)),

        ...(isProduct
          ? new Map(
              menu.submenus
                .flatMap((s: any) => getSubcategoryData(s.rightSubcategories))
                .map((obj: any) => [obj.id, obj])
            ).values()
          : new Map(
              menu.submenus
                .flatMap((s: any) => getBlogCategoryData(s.rightSubcategories))
                .map((obj: any) => [obj.id, obj])
            ).values()),
      ];

      // ✅ Generate menu banner info
      const banners =
        Array.isArray(menu.images) && menu.images.length > 0
          ? menu.images.map((img: string) => ({
              image: img,
              title: menu.name,
              link:
                menu.type === "blog"
                  ? "/blogs/journal"
                  : `/shop/${menu.slug}`,
            }))
          : [];

      return {
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        type: menu.type,
        dropdown: {
          left: Array.from(leftMerged),
          right: Array.from(rightMerged),
          banners,
        },
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("❌ Header API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load header data" },
      { status: 500 }
    );
  }
}
