"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authApi } from "../lib/api"

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
    const checkAuth = async () => {
      console.log('AuthGuard: Checking authentication for path:', pathname)
      
      // Check if user has a valid JWT token
      const isAuth = authApi.isAuthenticated()
      console.log('AuthGuard: Has token:', isAuth)
      
      if (isAuth) {
        try {
          // Verify token with backend
          console.log('AuthGuard: Verifying token with backend...')
          await authApi.getCurrentUser()
          console.log('AuthGuard: Token verified successfully')
          setIsAuthenticated(true)
          
          // If authenticated and trying to access auth pages, redirect to dashboard
          if (publicRoutes.includes(pathname)) {
            console.log('AuthGuard: Redirecting authenticated user from auth page to dashboard')
            router.push("/dashboard")
            return
          }
        } catch (error) {
          console.log('AuthGuard: Token verification failed:', error)
          // Token is invalid, clear auth state
          await authApi.logout()
          setIsAuthenticated(false)
          
          if (!publicRoutes.includes(pathname)) {
            console.log('AuthGuard: Redirecting unauthenticated user to login')
            router.push("/login")
            return
          }
        }
      } else {
        console.log('AuthGuard: No token found')
        setIsAuthenticated(false)
        
        // If not authenticated and trying to access protected route
        if (!publicRoutes.includes(pathname)) {
          console.log('AuthGuard: Redirecting to login - no token for protected route')
          router.push("/login")
          return
        }
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
