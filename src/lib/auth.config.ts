import type { NextAuthConfig } from "next-auth"
import type { User } from "next-auth"

export default {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const authRoutes = ["/login", "/register", "/forgot-password", "/verify-email"]
      const protectedPrefixes = ["/dashboard", "/onboarding"]

      const isAuthRoute = authRoutes.includes(pathname)
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

      if (isProtected) {
        if (isLoggedIn) return true
        return Response.redirect(new URL("/login", nextUrl))
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        const u = user as User
        token.id = u.id ?? ""
        token.slug = u.slug
        token.plan = u.plan
        token.onboardingDone = u.onboardingDone
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.slug = token.slug as string
      session.user.plan = token.plan as string
      session.user.onboardingDone = token.onboardingDone as boolean
      return session
    },
  },
} satisfies NextAuthConfig
