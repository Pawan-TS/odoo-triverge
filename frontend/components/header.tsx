"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Settings, LogOut, User } from "lucide-react"
import { MobileSidebar } from "./mobile-sidebar"

export function Header() {
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role === "admin" ? "Admin" : "Invoicing User")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  return (
    <header className="bg-background border-b border-border px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MobileSidebar />
          <h1 className="ml-3 text-lg font-semibold md:hidden">Shiv Accounts</h1>
        </div>

        <div className="flex items-center justify-end flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium hidden xs:inline">{userRole || "User"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
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
