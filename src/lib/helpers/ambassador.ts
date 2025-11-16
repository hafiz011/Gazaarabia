import { prisma } from "@/lib/prisma";

/**
 * Check if a product belongs to an ambassador
 * and return ambassador details + commission from HomePageSetting.
 */
export async function getAmbassadorForProduct(productId: number) {
    // 1. Fetch product with ambassador assigned
    const product = await prisma.products.findUnique({
        where: { id: productId },
        select: {
            ambassadorId: true,
            ambassador: {
                select: {
                    id: true,
                    type: true,
                    userId: true
                }
            }
        }
    });

    // No ambassador assigned to product
    if (!product?.ambassadorId) {
        return {
            isAmbassadorProduct: false,
            ambassadorId: null,
            commissionPercent: null,
            ambassadorData: null
        };
    }

    // 2. Fetch global commission set by admin in homepage settings
    const settings = await prisma.homePageSetting.findFirst({
        select: {
            ambassadorCommission: true // %
        }
    });

    const commissionPercent = settings?.ambassadorCommission ?? 0;

    return {
        isAmbassadorProduct: true,
        ambassadorId: product.ambassadorId,
        commissionPercent, // <-- admin-set % from homePageSetting
        ambassadorData: product.ambassador
    };
}
