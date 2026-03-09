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
    // Save extra info in JWT token
    async jwt({ token, user, profile }) {
      if (user) {
        token.email = user.email
        token.name = profile?.name || user.name || ""
        token.picture = profile?.picture || user.image || ""
      }
      return token
    },

    // Make session include token info
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email || ""
        session.user.name = token.name || ""
        session.user.image = token.picture || ""
      }
      return session
    },

  async signIn({ user }) {
  if (!user.email) return false

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

  await fetch(`${baseUrl}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      name: user.name || "Unknown",
      image: user.image || "",
    }),
  })

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