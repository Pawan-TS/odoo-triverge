"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ShoppingBag,
  FileText,
  Bot,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [salesOpen, setSalesOpen] = useState(false)
  const [purchasesOpen, setPurchasesOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: Users,
      label: "Contacts",
      href: "/contacts",
      active: pathname === "/contacts",
    },
    {
      icon: Package,
      label: "Products",
      href: "/products",
      active: pathname === "/products",
    },
    {
      icon: ShoppingCart,
      label: "Sale",
      hasSubmenu: true,
      isOpen: salesOpen,
      onToggle: () => setSalesOpen(!salesOpen),
      active: pathname.startsWith("/sale"),
      submenu: [
        { label: "Sale Order", href: "/sale/orders" },
        { label: "Sale Invoice", href: "/sale/invoices" },
        { label: "Receipt", href: "/sale/receipts" },
      ],
    },
    {
      icon: ShoppingBag,
      label: "Purchase",
      hasSubmenu: true,
      isOpen: purchasesOpen,
      onToggle: () => setPurchasesOpen(!purchasesOpen),
      active: pathname.startsWith("/purchase"),
      submenu: [
        { label: "Purchase Order", href: "/purchase/orders" },
        { label: "Purchase Bill", href: "/purchase/bills" },
        { label: "Payment", href: "/purchase/payments" },
      ],
    },
    {
      icon: FileText,
      label: "Report",
      hasSubmenu: true,
      isOpen: reportsOpen,
      onToggle: () => setReportsOpen(!reportsOpen),
      active: pathname.startsWith("/report"),
      submenu: [
        { label: "Profit & Loss", href: "/report/profit-loss" },
        { label: "Balance Sheet", href: "/report/balance-sheet" },
        { label: "Stock Statement", href: "/report/stock-statement" },
      ],
    },
    {
      icon: Bot,
      label: "AI Assistant",
      href: "/ai-assistant",
      active: pathname === "/ai-assistant",
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  return (
    <div className={cn("bg-sidebar text-sidebar-foreground w-64 min-h-screen p-4 flex flex-col", className)}>
      {/* Logo */}
      <div className="mb-8">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold text-sidebar-foreground hover:text-sidebar-primary cursor-pointer">
            Shiv Accounts
          </h1>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.hasSubmenu ? (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  item.active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
                )}
                onClick={item.onToggle}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
                <div className="ml-auto">
                  {item.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </Button>
            ) : (
              <Link href={item.href || "#"}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    item.active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )}

            {item.hasSubmenu && item.isOpen && (
              <div className="ml-6 mt-2 space-y-1">
                {item.submenu?.map((subItem, subIndex) => (
                  <Link key={subIndex} href={subItem.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        pathname === subItem.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                      )}
                    >
                      {subItem.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
