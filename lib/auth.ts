import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { sql } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        // Check if user exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${user.email}
        `

        if (existingUser.length === 0) {
          // Create new user
          await sql`
            INSERT INTO users (id, name, email, image)
            VALUES (${user.id}, ${user.name}, ${user.email}, ${user.image})
          `
        } else {
          // Update existing user
          await sql`
            UPDATE users 
            SET name = ${user.name}, image = ${user.image}, updated_at = CURRENT_TIMESTAMP
            WHERE email = ${user.email}
          `
        }

        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await sql`
          SELECT id FROM users WHERE email = ${session.user.email}
        `
        if (user.length > 0) {
          session.user.id = user[0].id
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})
