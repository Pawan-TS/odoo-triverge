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
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Sales</h1>
            <p className="text-muted-foreground">Manage your sales orders and invoices</p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
              <Button>
                <FileText className="mr-2 h-4 w-4" />
                New Invoice
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">Sales Orders</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <div className="grid gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          <p className="text-muted-foreground">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {order.date} • Items: {order.items}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-lg">{order.amount}</p>
                            <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <div className="grid gap-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{invoice.id}</h3>
                          <p className="text-muted-foreground">{invoice.customer}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {invoice.date} • Due: {invoice.dueDate}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-lg">{invoice.amount}</p>
                            <p className="text-sm text-muted-foreground">Balance: {invoice.balance}</p>
                            <Badge variant={getStatusColor(invoice.status) as any}>{invoice.status}</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
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
