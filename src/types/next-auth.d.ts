import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      slug: string
      plan: string
      onboardingDone: boolean
    } & DefaultSession["user"]
  }

  interface User {
    slug: string
    plan: string
    onboardingDone: boolean
    passwordHash?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    slug: string
    plan: string
    onboardingDone: boolean
  }
}
