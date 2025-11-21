import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      token: string;
      affiliateId?: number | null;
      affiliateType?: string | null;
      stripeCustomerId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    affiliateId?: number | null;
    affiliateType?: string | null;
    stripeCustomerId?: string | null;
  }
}
