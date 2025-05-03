"use client"

import type React from "react"

import { useSession } from "next-auth/react"

interface UserCheckProps {
  email: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function UserCheck({ email, children, fallback = null }: UserCheckProps) {
  const { data: session } = useSession()

  if (session?.user?.email === email) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
