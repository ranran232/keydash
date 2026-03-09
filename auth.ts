
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
secret:process.env.BETTER_AUTH_SECRET,
  providers: [Google],
   callbacks: {
     async signIn({ user }) {
      if (user.email) {
        try {
          const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
          await fetch(`${baseUrl}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image
            })
          })
        } catch (error) {
          console.error("Error saving user:", error)
        }
      }
      return true
    },
    authorized: async ({ auth }) => {
      
      return !!auth
    },
  },
  pages:{
    signIn:"/signin",
  }
})