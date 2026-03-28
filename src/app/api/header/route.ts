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


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function GET() {
  try {
    //  Fetch menus and their submenus
    const menus = await prisma.menus.findMany({
      include: { submenus: true },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    //  Fetch all related data
   const [allSubcategories, allBlogCategories] = await Promise.all([
  prisma.subcategory.findMany({
    select: { id: true, name: true, slug: true, categoryId: true },
  }),
  prisma.blogCategories.findMany({
    select: { id: true, name: true, slug: true },
  }),
]);
    // Utility: Safe JSON parsing
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

    // Custom Links Parser — allow empty slug
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

    //  Subcategory Mapper (Product Menus)
    // const getSubcategoryData = (ids: any) => {
    //   const parsed = parseJSON(ids);
    //   return parsed
    //     .map((id: number) => allSubcategories.find((s: any) => s.id === Number(id)))
    //     .filter(Boolean);
    // };

    //  Blog Category Mapper (Blog Menus)
    // const getBlogCategoryData = (ids: any) => {
    //   const parsed = parseJSON(ids);
    //   return parsed
    //     .map((id: number) => allBlogCategories.find((b: any) => b.id === Number(id)))
    //     .filter(Boolean);
    // };

    //  Build final structured response
    // const formatted = menus.map((menu: any) => {
    //   const isBlog = menu.type === "blog";
    //   const isProduct = menu.type === "product";

    //   if (!menu.submenus?.length) {
    //     return {
    //       id: menu.id,
    //       name: menu.name,
    //       slug: menu.slug,
    //       type: menu.type,
    //       dropdown: null,
    //     };
    //   }

    //   // Merge Left Column
    //   // const leftMerged = [
    //   //   // Custom links always first
    //   //   ...menu.submenus.flatMap((s: any) => getCustomLinks(s.leftCustomLinks)),

    //   //   // Product subcategories or blog categories
    //   //   ...(isProduct
    //   //     ? new Map(
    //   //       menu.submenus
    //   //         .flatMap((s: any) => getSubcategoryData(s.leftSubcategories))
    //   //         .map((obj: any) => [obj.id, obj])
    //   //     ).values()
    //   //     : new Map(
    //   //       menu.submenus
    //   //         .flatMap((s: any) => getBlogCategoryData(s.leftSubcategories))
    //   //         .map((obj: any) => [obj.id, obj])
    //   //     ).values()),
    //   // ];

    //   // Merge Right Column
    //   // const rightMerged = [
    //   //   ...menu.submenus.flatMap((s: any) => getCustomLinks(s.rightCustomLinks)),

    //   //   ...(isProduct
    //   //     ? new Map(
    //   //       menu.submenus
    //   //         .flatMap((s: any) => getSubcategoryData(s.rightSubcategories))
    //   //         .map((obj: any) => [obj.id, obj])
    //   //     ).values()
    //   //     : new Map(
    //   //       menu.submenus
    //   //         .flatMap((s: any) => getBlogCategoryData(s.rightSubcategories))
    //   //         .map((obj: any) => [obj.id, obj])
    //   //     ).values()),
    //   // ];

    //   //  Generate menu banner info
    //   const banners =
    //     Array.isArray(menu.images) && menu.images.length > 0
    //       ? menu.images.map((img: string) => ({
    //         image: img,
    //         title: menu.name,
    //         link:
    //           menu.type === "blog"
    //             ? "/blogs/journal"
    //             : `/shop/${menu.slug}`,
    //       }))
    //       : [];

    //   return {
    //     id: menu.id,
    //     name: menu.name,
    //     slug: menu.slug,
    //     type: menu.type,
    //     dropdown: {
    //       // left: Array.from(leftMerged),
    //       // right: Array.from(rightMerged),
    //       banners,
    //     },
    //   };
    // });

    console.log('menus:>',menus)

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

      const submenuData = menu.submenus.map((submenu: any) => {
        let categorySubcategories: any[] = [];

        //  Get ALL subcategories of selected category
        if (submenu.categoryId) {
          categorySubcategories = allSubcategories.filter(
            (sub: any) => sub.categoryId === submenu.categoryId
          );
        }

        return {
          id: submenu.id,
          name: submenu.name,
          slug: submenu.slug,
          categoryId: submenu.categoryId,
          subcategories: categorySubcategories,
          // leftCustomLinks: getCustomLinks(submenu.leftCustomLinks),
          // rightCustomLinks: getCustomLinks(submenu.rightCustomLinks),
        };
      });

      // banners logic
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
          submenus: submenuData,
          banners,
        },
      };
    });

    // Fetch Homepage Settings (only one row expected)
    const homepage = await prisma.homePageSetting.findFirst({
      select: { headerText: true }
    });


    return NextResponse.json({ success: true, headerText: homepage?.headerText || "", data: formatted });
  } catch (error) {
    console.error("Header API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load header data" },
      { status: 500 }
    );
  }
}
