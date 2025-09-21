"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Filter,
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

// Types
interface SalesOrderLine {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  taxId?: number;
  taxRate?: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

interface SalesOrder {
  id?: number;
  documentNumber?: string;
  contactId: number;
  contactName?: string;
  orderDate: string;
  status: 'Draft' | 'Confirmed' | 'Invoiced' | 'Cancelled';
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  lines?: SalesOrderLine[];
  notes?: string;
  createdAt?: string;
}

interface SalesOrderStats {
  totalOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
}

interface Contact {
  id: number;
  name: string;
  contactType: string;
}

interface Product {
  id: number;
  productName: string;
  salePrice: number;
  taxId?: number;
}

export default function SaleOrdersPage() {
  // State management
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([])
  const [stats, setStats] = useState<SalesOrderStats>({
    totalOrders: 0,
    draftOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0
  })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)
  
  // Form state
  const [orderForm, setOrderForm] = useState<{
    contactId: number | null;
    orderDate: string;
    notes: string;
    lines: SalesOrderLine[];
  }>({
    contactId: null,
    orderDate: new Date().toISOString().split('T')[0],
    notes: '',
    lines: [{
      productId: 0,
      quantity: 1,
      unitPrice: 0,
      subtotal: 0,
      taxAmount: 0,
      total: 0
    }]
  })

  const { toast } = useToast()

  // Load data
  const loadSalesOrders = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      const mockOrders: SalesOrder[] = [
        {
          id: 1,
          documentNumber: "SO-001",
          contactId: 1,
          contactName: "Acme Corp",
          orderDate: "2025-01-15",
          status: "Confirmed",
          subtotal: 5000.00,
          totalTax: 900.00,
          totalAmount: 5900.00,
          createdAt: "2025-01-15T10:30:00Z"
        },
        {
          id: 2,
          documentNumber: "SO-002",
          contactId: 2,
          contactName: "Tech Solutions Inc",
          orderDate: "2025-01-14",
          status: "Draft",
          subtotal: 3500.00,
          totalTax: 630.00,
          totalAmount: 4130.00,
          createdAt: "2025-01-14T14:20:00Z"
        }
      ]
      
      setSalesOrders(mockOrders)
      setFilteredOrders(mockOrders)
      
      // Calculate stats
      const stats = {
        totalOrders: mockOrders.length,
        draftOrders: mockOrders.filter(o => o.status === 'Draft').length,
        confirmedOrders: mockOrders.filter(o => o.status === 'Confirmed').length,
        totalRevenue: mockOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      }
      setStats(stats)
      
    } catch (error) {
      console.error('Error loading sales orders:', error)
      toast({
        title: "Error",
        description: "Failed to load sales orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      // TODO: Replace with actual API call
      const mockContacts: Contact[] = [
        { id: 1, name: "Acme Corp", contactType: "Customer" },
        { id: 2, name: "Tech Solutions Inc", contactType: "Customer" },
        { id: 3, name: "Global Enterprises", contactType: "Customer" }
      ]
      setContacts(mockContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadProducts = async () => {
    try {
      // TODO: Replace with actual API call
      const mockProducts: Product[] = [
        { id: 1, productName: "Office Chair", salePrice: 2500.00, taxId: 1 },
        { id: 2, productName: "Desk Lamp", salePrice: 1500.00, taxId: 1 },
        { id: 3, productName: "Computer Monitor", salePrice: 15000.00, taxId: 1 }
      ]
      setProducts(mockProducts)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  // Search and filter
  useEffect(() => {
    let filtered = salesOrders

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, salesOrders])

  // Form utilities
  const addOrderLine = () => {
    setOrderForm(prev => ({
      ...prev,
      lines: [...prev.lines, {
        productId: 0,
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
        taxAmount: 0,
        total: 0
      }]
    }))
  }

  const removeOrderLine = (index: number) => {
    setOrderForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }))
  }

  const updateOrderLine = (index: number, field: keyof SalesOrderLine, value: any) => {
    setOrderForm(prev => {
      const newLines = [...prev.lines]
      newLines[index] = { ...newLines[index], [field]: value }
      
      // Recalculate totals
      if (field === 'productId' || field === 'quantity' || field === 'unitPrice') {
        const line = newLines[index]
        const product = products.find(p => p.id === line.productId)
        
        if (product && field === 'productId') {
          line.unitPrice = product.salePrice
          line.productName = product.productName
        }
        
        line.subtotal = line.quantity * line.unitPrice
        line.taxAmount = line.subtotal * 0.18 // Assuming 18% tax
        line.total = line.subtotal + line.taxAmount
      }
      
      return { ...prev, lines: newLines }
    })
  }

  const calculateOrderTotals = () => {
    const subtotal = orderForm.lines.reduce((sum, line) => sum + line.subtotal, 0)
    const totalTax = orderForm.lines.reduce((sum, line) => sum + line.taxAmount, 0)
    const totalAmount = subtotal + totalTax
    
    return { subtotal, totalTax, totalAmount }
  }

  const resetForm = () => {
    setOrderForm({
      contactId: null,
      orderDate: new Date().toISOString().split('T')[0],
      notes: '',
      lines: [{
        productId: 0,
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
        taxAmount: 0,
        total: 0
      }]
    })
  }

  const handleCreateOrder = async () => {
    try {
      if (!orderForm.contactId || orderForm.lines.some(line => !line.productId)) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const totals = calculateOrderTotals()
      
      // TODO: Replace with actual API call
      const newOrder: SalesOrder = {
        id: Date.now(),
        documentNumber: `SO-${String(salesOrders.length + 1).padStart(3, '0')}`,
        contactId: orderForm.contactId,
        contactName: contacts.find(c => c.id === orderForm.contactId)?.name,
        orderDate: orderForm.orderDate,
        status: 'Draft',
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        totalAmount: totals.totalAmount,
        lines: orderForm.lines,
        notes: orderForm.notes
      }

      setSalesOrders(prev => [newOrder, ...prev])
      setIsCreateDialogOpen(false)
      resetForm()
      
      toast({
        title: "Success",
        description: "Sales order created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sales order",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Confirmed': return 'bg-blue-100 text-blue-800'
      case 'Invoiced': return 'bg-green-100 text-green-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft': return <Clock className="h-4 w-4" />
      case 'Confirmed': return <CheckCircle className="h-4 w-4" />
      case 'Invoiced': return <Package className="h-4 w-4" />
      case 'Cancelled': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  useEffect(() => {
    loadSalesOrders()
    loadContacts()
    loadProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
          <Header />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading sales orders...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <Header />

        <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Sale Orders</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Manage your sales orders and quotations
                </p>
              </div>
            </div>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Sale Order
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <div className="text-lg sm:text-2xl font-bold">{stats.totalOrders}</div>
                  </div>
                  <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Draft Orders</p>
                    <div className="text-lg sm:text-2xl font-bold">{stats.draftOrders}</div>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                    <div className="text-lg sm:text-2xl font-bold">{stats.confirmedOrders}</div>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <div className="text-lg sm:text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search orders by number or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="invoiced">Invoiced</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Orders</CardTitle>
              <CardDescription>
                View and manage all your sales orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "No orders found matching your criteria" 
                      : "No sales orders found. Create your first sale order to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Order #</TableHead>
                        <TableHead className="min-w-[150px]">Customer</TableHead>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px] text-right">Amount</TableHead>
                        <TableHead className="min-w-[120px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.documentNumber}
                          </TableCell>
                          <TableCell>{order.contactName}</TableCell>
                          <TableCell>
                            {new Date(order.orderDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{order.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Order Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Sales Order</DialogTitle>
                <DialogDescription>
                  Add a new sales order with customer and product details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer and Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select onValueChange={(value) => setOrderForm(prev => ({ ...prev, contactId: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.filter(c => c.contactType === 'Customer' || c.contactType === 'Both').map(contact => (
                          <SelectItem key={contact.id} value={contact.id.toString()}>
                            {contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderDate">Order Date *</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={orderForm.orderDate}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, orderDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Order Lines */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Order Lines</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOrderLine}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {orderForm.lines.map((line, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Line {index + 1}</span>
                          {orderForm.lines.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeOrderLine(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <Label>Product *</Label>
                            <Select onValueChange={(value) => updateOrderLine(index, 'productId', parseInt(value))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map(product => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.productName} - ₹{product.salePrice}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Quantity *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) => updateOrderLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(e) => updateOrderLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Subtotal: </span>
                            <span className="font-medium">₹{line.subtotal.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tax: </span>
                            <span className="font-medium">₹{line.taxAmount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total: </span>
                            <span className="font-medium">₹{line.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t pt-4">
                    <div className="flex justify-end">
                      <div className="space-y-2 min-w-[200px]">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">₹{calculateOrderTotals().subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span className="font-medium">₹{calculateOrderTotals().totalTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>Total:</span>
                          <span>₹{calculateOrderTotals().totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes for this order..."
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder} className="w-full sm:w-auto">
                  Create Sales Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
