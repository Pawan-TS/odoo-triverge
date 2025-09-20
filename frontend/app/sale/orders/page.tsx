import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus } from "lucide-react"

export default function SaleOrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <Header />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Sale Orders</h1>
                <p className="text-muted-foreground">Manage your sales orders and quotations</p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Sale Order
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sale Orders</CardTitle>
              <CardDescription>View and manage all your sale orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No sale orders found. Create your first sale order to get started.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
