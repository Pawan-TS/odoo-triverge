import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Download, Calendar } from "lucide-react"

export default function ProfitLossPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <Header />

        <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Profit & Loss</h1>
                <p className="text-sm sm:text-base text-muted-foreground">View your income statement and profitability</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>Income statement for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No data available. Start recording transactions to generate your P&L report.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
