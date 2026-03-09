import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

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
    // Save extra info in JWT token on first sign-in
    async jwt({ token, user, profile }) {
      if (user) {
        token.email = user.email
        token.name = profile?.name || token.name || "Unknown"
        token.picture = profile?.picture || token.picture || ""
      }
      return token
    },

    // Include JWT info in the session
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email || ""
        session.user.name = token.name || ""
        session.user.image = token.picture || ""
      }
      return session
    },

    // Sign-in callback: store user in MongoDB
    async signIn({ user, profile }) {
      if (!user.email) return false

      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"

      await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: profile?.name || "Unknown",
          image: profile?.picture || "",
        }),
      })
      console.log(user.email, profile?.name, profile?.picture)
      return true
    },

    async authorized({ auth }) {
      return !!auth
    },
  },
  pages: {
    signIn: "/signin",
  },
})