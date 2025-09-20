"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { KPICards } from "@/components/kpi-cards"
import { SalesChart } from "@/components/sales-chart"
import { DataTables } from "@/components/data-tables"
import { AIAssistant } from "@/components/ai-assistant"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { FileText, UserPlus, CreditCard, BarChart3 } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()

  const quickActions = [
    {
      icon: FileText,
      label: "Create Invoice",
      action: () => router.push("/invoices"),
      description: "Create a new invoice"
    },
    {
      icon: UserPlus,
      label: "Add Customer",
      action: () => router.push("/customers"),
      description: "Add a new customer"
    },
    {
      icon: CreditCard,
      label: "Record Payment",
      action: () => router.push("/sale/receipts"),
      description: "Record a payment"
    },
    {
      icon: BarChart3,
      label: "Generate Report",
      action: () => router.push("/reports"),
      description: "View business reports"
    }
  ]
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* KPI Cards */}
          <KPICards />

          {/* Charts and Tables Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Sales Chart - Takes 2 columns on desktop */}
            <div className="xl:col-span-2">
              <SalesChart />
            </div>

            {/* Quick Actions Card */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-card p-4 sm:p-6 rounded-lg border">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start p-3 sm:p-2 h-auto text-left"
                      onClick={action.action}
                    >
                      <action.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">{action.label}</span>
                        <span className="text-xs text-muted-foreground">{action.description}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Tables */}
          <DataTables />
        </main>
      </div>

      {/* AI Assistant - Hidden on mobile, shown on larger screens */}
      <div className="hidden lg:block">
        <AIAssistant />
      </div>
    </div>
  )
}
