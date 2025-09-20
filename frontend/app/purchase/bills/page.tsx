import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

export default function PurchaseBillsPage() {
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
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Purchase Bills</h1>
                <p className="text-muted-foreground">Record and manage vendor bills</p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Bill
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Bills</CardTitle>
              <CardDescription>View and manage all your purchase bills</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                No bills found. Record your first vendor bill to get started.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
