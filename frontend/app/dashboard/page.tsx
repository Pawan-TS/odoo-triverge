import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { KPICards } from "@/components/kpi-cards"
import { SalesChart } from "@/components/sales-chart"
import { DataTables } from "@/components/data-tables"
import { AIAssistant } from "@/components/ai-assistant"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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

            {/* Additional KPI or Summary Card */}
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-card p-4 sm:p-6 rounded-lg border">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 sm:p-2 hover:bg-muted rounded text-sm font-medium transition-colors">
                    Create Invoice
                  </button>
                  <button className="w-full text-left p-3 sm:p-2 hover:bg-muted rounded text-sm font-medium transition-colors">
                    Add Customer
                  </button>
                  <button className="w-full text-left p-3 sm:p-2 hover:bg-muted rounded text-sm font-medium transition-colors">
                    Record Payment
                  </button>
                  <button className="w-full text-left p-3 sm:p-2 hover:bg-muted rounded text-sm font-medium transition-colors">
                    Generate Report
                  </button>
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
