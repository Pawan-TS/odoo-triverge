"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AIAssistant } from "@/components/ai-assistant"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    sku: "WH-001",
    category: "Electronics",
    price: "$99.99",
    stock: 45,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    sku: "BS-002",
    category: "Electronics",
    price: "$79.99",
    stock: 23,
    status: "In Stock",
  },
  {
    id: 3,
    name: "USB Cable",
    sku: "UC-003",
    category: "Accessories",
    price: "$12.99",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "Laptop Stand",
    sku: "LS-004",
    category: "Accessories",
    price: "$45.99",
    stock: 12,
    status: "Low Stock",
  },
  {
    id: 5,
    name: "Wireless Mouse",
    sku: "WM-005",
    category: "Electronics",
    price: "$29.99",
    stock: 67,
    status: "In Stock",
  },
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "default"
      case "Low Stock":
        return "secondary"
      case "Out of Stock":
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
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">Manage your inventory and product catalog</p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>SKU: {product.sku}</span>
                          <span>Category: {product.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-semibold text-lg">{product.price}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                      </div>
                      <Badge variant={getStatusColor(product.status) as any}>{product.status}</Badge>
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
        </main>
      </div>

      <AIAssistant />
    </div>
  )
}
