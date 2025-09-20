"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/forgot-password"]

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const isAuth = authStatus === "true"
      setIsAuthenticated(isAuth)

      // If not authenticated and trying to access protected route
      if (!isAuth && !publicRoutes.includes(pathname)) {
        router.push("/login")
        return
      }

      // If authenticated and trying to access auth pages, redirect to dashboard
      if (isAuth && publicRoutes.includes(pathname)) {
        router.push("/dashboard")
        return
      }
    }

    checkAuth()
  }, [pathname, router])

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
