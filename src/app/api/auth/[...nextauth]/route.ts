// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";

// const handler = NextAuth({
//   secret: process.env.NEXTAUTH_SECRET,
//   session: { strategy: "jwt" },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Email and password are required");
//         }

//         const user = await prisma.users.findUnique({
//           where: { email: credentials.email },
//           include: {
//             role: true, // include role info if needed
//           },
//         });

//         if (!user) {
//           throw new Error("Invalid email or password");
//         }

//         const validPassword = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!validPassword) {
//           throw new Error("Invalid email or password");
//         }

//         // You can restrict admin login here if needed
//         if (user.role.name !== "ADMIN") {
//           throw new Error("Access denied. Not an admin user.");
//         }

//         return {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role.name,
//         };
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/admin/login",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) token.user = user;
//       return token;
//     },
//     async session({ session, token }) {
//       session.user = token.user as any;
//       return session;
//     },
//   },
// });

// export { handler as GET, handler as POST };
