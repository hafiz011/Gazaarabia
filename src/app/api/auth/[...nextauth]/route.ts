import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authService } from "@/lib/services/authService";

const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password || !credentials?.role) {
            throw new Error("Email and password are required");
          }

          //  Call your custom login API
          const res = await authService.login({
            email: credentials.email,
            password: credentials.password,
            role: credentials.role
          });

          // Check response structure
          if (res && res.token && res.user) {
            return {
              id: res.user.id.toString(),
              name: res.user.name,
              email: res.user.email,
              token: res.token,
              role: res.user.roleName, // or res.user.role if you have a string role
              user_id: res.user.id,

              affiliateId: res.user.affiliateId,
              affiliateType: res.user.affiliateType,
            };
          }

          // If invalid credentials
          return null;
        } catch (error: any) {
          console.error("Authorization error:", error);
          throw new Error(error.message || "Login failed");
        }
      },
    }),
  ],

  pages: {
    signIn: "/account/login", // use your login page route
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },

  callbacks: {
    async jwt({ token, user }: any) {
      // Attach user info to token after login
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.token = user.token;
        token.role = user.role;
        token.user_id = user.user_id;

        token.affiliateId = user.affiliateId;
        token.affiliateType = user.affiliateType;
      }
      return token;
    },

    async session({ session, token }: any) {
      // Attach token info to session.user
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        token: token.token,
        role: token.role,
        user_id: token.user_id,
        affiliateId: token.affiliateId,
        affiliateType: token.affiliateType,

      };
      return session;
    },

    async redirect({ url, baseUrl }: any) {
      //  Smart redirect after login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
