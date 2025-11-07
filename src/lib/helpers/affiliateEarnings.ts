import { PrismaClient } from "@prisma/client";
const prisma: any = new PrismaClient();

export async function getAffiliateEarnings(affiliateId: number) {
  const orders = await prisma.orders.findMany({
    where: { affiliateId },
    select: {
      affiliateEarning: true,
      affiliatePaid: true, 
    },
  });

  let totalEarnings = 0;
  let pendingEarnings = 0;

  for (const o of orders) {
    const amount = o.affiliateEarning ?? 0;
    totalEarnings += amount;
    if (!o.affiliatePaid) pendingEarnings += amount;
  }

  return {
    totalEarnings,
    pendingEarnings,
  };
}
