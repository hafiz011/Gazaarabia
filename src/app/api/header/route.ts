interface HeaderMenu {
  id: number;
  name: string;
  slug: string;
  type: string;
  dropdown?: {
    submenus: { id: number; name: string; slug: string }[];
    categories: { id?: number; name: string; slug: string; isCustom?: boolean }[];
    subcategories: { id?: number; name: string; slug: string; isCustom?: boolean }[];
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
   const [allCategories, allBlogCategories] = await Promise.all([
   prisma.categories.findMany({
    include: { subcategories: { select: { id: true, name: true, slug: true, categoryId: true } } },
  }),
    // prisma.subcategory.findMany({
  //   select: { id: true, name: true, slug: true, categoryId: true },
  // }),
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

    

    // console.log('menus:>',menus)

    const formatted = menus.map((menu: any) => {
      const isBlog = menu.type === "blog";
      const isProduct = menu.type === "product";

      if (!menu.submenus?.length) {
        return {
          id: menu.id,
          name: menu.name,
          slug: menu.slug,
          type: menu.type,
          dropdown: { submenus: [], banners: [] },
        };
      }

      const submenuData = menu.submenus.map((submenu: any) => {
        let categoryObj: any[] = [];
        // let categorySubcategories: any[] = [];
       

        //  Get ALL categories of selected submenu
        if (submenu.categoryId) {
          categoryObj = allCategories.find((c: any) => c.id === submenu.categoryId )|| null;
          // categorySubcategories = allCategories.flatMap((c: any) => c.subcategories || []);
          
        }

        return {
          id: submenu.id,
          name: submenu.name,
          slug: submenu.slug,
          category: categoryObj,
          // subcategories: categorySubcategories,
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
