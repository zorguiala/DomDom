import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Ensure this route is always dynamic (not statically generated)
export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[DEBUG] Received credentials:", credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("No user found with email:", credentials.email);
          return null;
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isValidPassword) {
          console.log("Invalid password for user:", credentials.email);
          return null;
        }

        console.log("User authorized:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      // Persist the user id and role to the token right after signin
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    // Add other pages like error, verifyRequest if needed
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET, // Ensure NEXTAUTH_SECRET is set in your .env
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
