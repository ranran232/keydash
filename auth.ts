
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
secret:process.env.BETTER_AUTH_SECRET,
  providers: [Google],
   callbacks: {
    authorized: async ({ auth }) => {
     
      return !!auth
    },
  },
  pages:{
    signIn:"/signin",
  }
})