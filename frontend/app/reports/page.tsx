import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ProfitLossReport } from "@/components/reports/profit-loss"

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <ProfitLossReport />
        </main>
      </div>
    </div>
  )
}
