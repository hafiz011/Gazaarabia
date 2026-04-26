import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

interface Subcategory {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  subcategories: Subcategory[];
}

interface Submenu {
  id: number;
  name: string;
  slug: string;
  categories: Category[];
}

interface MenuDropdown {
  submenus: Submenu[];
  banners: { image: string; title: string; link: string }[];
}

interface FormattedMenu {
  id: number;
  name: string;
  slug: string;
  type: string;
  dropdown: MenuDropdown;
}

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch menus with full nested hierarchy in one optimized query
    const menus = await prisma.menus.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        images: true,
        submenus: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            categories: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                subcategories: {
                  orderBy: { position: "asc" },
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Fetch homepage settings
    const homepage = await prisma.homePageSetting.findFirst({
      select: { headerText: true },
    });

    // Transform to frontend format
    const formatted: FormattedMenu[] = menus.map((menu: any) => {
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
          submenus: menu.submenus.map((submenu: any) => ({
            id: submenu.id,
            name: submenu.name,
            slug: submenu.slug,
            categories: submenu.categories || [],
          })),
          banners,
        },
      };
    });

    return NextResponse.json({
      success: true,
      headerText: homepage?.headerText || "",
      data: formatted,
    });
  } catch (error) {
    console.error("Header API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load header data" },
      { status: 500 }
    );
  }
}

