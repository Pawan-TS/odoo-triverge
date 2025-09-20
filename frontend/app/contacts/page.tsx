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
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react"

const customers = [
  {
    id: 1,
    name: "Acme Corp",
    email: "contact@acme.com",
    phone: "+1-555-0123",
    type: "Customer",
    status: "Active",
    balance: "$2,450.00",
  },
  {
    id: 2,
    name: "Tech Solutions Inc",
    email: "info@techsol.com",
    phone: "+1-555-0124",
    type: "Customer",
    status: "Active",
    balance: "$1,200.00",
  },
  {
    id: 3,
    name: "Global Enterprises",
    email: "sales@global.com",
    phone: "+1-555-0125",
    type: "Customer",
    status: "Inactive",
    balance: "$0.00",
  },
]

const vendors = [
  {
    id: 1,
    name: "Office Supplies Co",
    email: "orders@officesupplies.com",
    phone: "+1-555-0200",
    type: "Vendor",
    status: "Active",
    balance: "-$850.00",
  },
  {
    id: 2,
    name: "Tech Hardware Ltd",
    email: "sales@techhw.com",
    phone: "+1-555-0201",
    type: "Vendor",
    status: "Active",
    balance: "-$3,200.00",
  },
  {
    id: 3,
    name: "Marketing Agency",
    email: "hello@marketing.com",
    phone: "+1-555-0202",
    type: "Vendor",
    status: "Active",
    balance: "-$1,500.00",
  },
]

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("customers")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Contacts</h1>
            <p className="text-muted-foreground">Manage your customers and vendors</p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
            </TabsList>

            <TabsContent value="customers" className="space-y-4">
              <div className="grid gap-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Mail className="mr-1 h-3 w-3" />
                                {customer.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-3 w-3" />
                                {customer.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                              {customer.status}
                            </Badge>
                            <p className="text-sm font-medium mt-1">{customer.balance}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="vendors" className="space-y-4">
              <div className="grid gap-4">
                {filteredVendors.map((vendor) => (
                  <Card key={vendor.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {vendor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{vendor.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Mail className="mr-1 h-3 w-3" />
                                {vendor.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="mr-1 h-3 w-3" />
                                {vendor.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <Badge variant={vendor.status === "Active" ? "default" : "secondary"}>
                              {vendor.status}
                            </Badge>
                            <p className="text-sm font-medium mt-1">{vendor.balance}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
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
