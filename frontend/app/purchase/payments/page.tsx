import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus } from "lucide-react"

export default function PurchasePaymentsPage() {
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
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Payments</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Track vendor payments and expenses</p>
              </div>
            </div>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Payments</CardTitle>
              <CardDescription>View and manage all your vendor payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No payments found. Record your first vendor payment to get started.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
