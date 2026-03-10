import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { createOrUpdateUser } from "./app/lib/models/user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],

  callbacks: {
    async authorized({ auth }) {
      // Allow access only if user is logged in
      return !!auth
    },

    async jwt({ token, user, profile }) {
      if (user && user.email && profile) {
        token.email = user.email
        token.name = profile.name || token.name || "Unknown"
        token.picture = profile.picture || token.picture || ""

        // Save user in MongoDB
        await createOrUpdateUser(user.email, {
          name: profile?.name || "Unknown",
          image: profile?.picture || "",
        })
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email || ""
        session.user.name = token.name || ""
        session.user.image = token.picture || ""
      }

      return session
    },
  },

  pages: {
    signIn: "/signin",
  },
})