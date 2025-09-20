"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AIAssistant } from "@/components/ai-assistant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Eye, FileText } from "lucide-react"

const salesOrders = [
  { id: "SO-001", customer: "Acme Corp", date: "2024-01-15", amount: "$2,450.00", status: "Confirmed", items: 3 },
  {
    id: "SO-002",
    customer: "Tech Solutions Inc",
    date: "2024-01-14",
    amount: "$1,200.00",
    status: "Pending",
    items: 2,
  },
  {
    id: "SO-003",
    customer: "Global Enterprises",
    date: "2024-01-13",
    amount: "$3,750.00",
    status: "Shipped",
    items: 5,
  },
]

const invoices = [
  {
    id: "INV-001",
    customer: "Acme Corp",
    date: "2024-01-15",
    dueDate: "2024-02-14",
    amount: "$2,450.00",
    status: "Paid",
    balance: "$0.00",
  },
  {
    id: "INV-002",
    customer: "Tech Solutions Inc",
    date: "2024-01-14",
    dueDate: "2024-02-13",
    amount: "$1,200.00",
    status: "Overdue",
    balance: "$1,200.00",
  },
  {
    id: "INV-003",
    customer: "Global Enterprises",
    date: "2024-01-13",
    dueDate: "2024-02-12",
    amount: "$3,750.00",
    status: "Sent",
    balance: "$3,750.00",
  },
]

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("orders")

  const filteredOrders = salesOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "default"
      case "Confirmed":
        return "default"
      case "Shipped":
        return "default"
      case "Pending":
        return "secondary"
      case "Sent":
        return "secondary"
      case "Overdue":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <Header />

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sales</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your sales orders and invoices</p>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4 sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
              <Button className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="orders" className="flex-1 sm:flex-none">Sales Orders</TabsTrigger>
              <TabsTrigger value="invoices" className="flex-1 sm:flex-none">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{order.id}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground truncate">{order.customer}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Date: {order.date} • Items: {order.items}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-base sm:text-lg">₹{order.amount.replace('$', '')}</p>
                            <Badge variant={getStatusColor(order.status) as any} className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{invoice.id}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground truncate">{invoice.customer}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Date: {invoice.date} • Due: {invoice.dueDate}
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-base sm:text-lg">₹{invoice.amount.replace('$', '')}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Balance: ₹{invoice.balance.replace('$', '')}</p>
                            <Badge variant={getStatusColor(invoice.status) as any} className="text-xs mt-1">
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}
