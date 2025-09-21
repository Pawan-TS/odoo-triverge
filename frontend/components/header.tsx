"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Settings, LogOut, User } from "lucide-react"
import { MobileSidebar } from "./mobile-sidebar"
import { authApi } from "../lib/api"

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Header: Starting to load user data...')
        console.log('Header: Is authenticated?', authApi.isAuthenticated())
        console.log('Header: Auth token:', localStorage.getItem('authToken') ? 'EXISTS' : 'MISSING')
        
        // First try to get user from localStorage (cached data)
        const cachedUser = authApi.getCurrentUser()
        console.log('Header: Cached user:', cachedUser)
        if (cachedUser) {
          setUser(cachedUser)
        }

        // Only try API call if we have a token
        if (authApi.isAuthenticated()) {
          // Then fetch fresh data from API
          console.log('Header: Fetching fresh user data from API...')
          const response = await authApi.getProfile()
          console.log('Header: API response:', response)
          if (response.success && response.data) {
            console.log('Header: Setting user data:', response.data)
            setUser(response.data)
          }
        } else {
          console.log('Header: No auth token, skipping API call')
        }
      } catch (error) {
        console.error("Header: Failed to load user data:", error)
        // If API call fails, try to use cached data
        const cachedUser = authApi.getCurrentUser()
        if (cachedUser) {
          console.log('Header: Using cached user as fallback:', cachedUser)
          setUser(cachedUser)
        }
      } finally {
        console.log('Header: Finished loading user data, final user state:', user)
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleLogout = async () => {
    try {
      // Use the proper API logout method
      await authApi.logout()
      // Navigate to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Even if API logout fails, navigate to login
      router.push("/login")
    }
  }

  return (
    <header className="bg-background border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MobileSidebar />
          <h1 className="ml-3 text-lg font-semibold md:hidden">Shiv Accounts</h1>
        </div>

        <div className="flex items-center justify-end flex-1">
          {/* Simple fallback button if dropdown doesn't work */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('Header: Simple profile button clicked')
              router.push("/profile")
            }}
            className="mr-2 md:hidden"
          >
            Profile
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 h-9 px-3"
                onClick={() => console.log('Header: Dropdown trigger clicked')}
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">
                  {loading ? "Loading..." : user ? `${user.firstName} ${user.lastName}` : "User"}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm text-muted-foreground border-b">
                <div className="font-medium">
                  {loading ? "Loading..." : user ? `${user.firstName} ${user.lastName}` : "Guest User"}
                </div>
                <div className="text-xs">{user?.email || "No email"}</div>
                <div className="text-xs">{user?.roles?.join(", ") || "Standard User"}</div>
              </div>
              <DropdownMenuItem 
                className="cursor-pointer" 
                onClick={() => {
                  console.log('Header: Profile clicked, navigating to /profile')
                  router.push("/profile")
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer" 
                onClick={() => {
                  console.log('Header: Settings clicked, navigating to /settings')
                  router.push("/settings")
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  console.log('Header: Logout clicked')
                  handleLogout()
                }} 
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
