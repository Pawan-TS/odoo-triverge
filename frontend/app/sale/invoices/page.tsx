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
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Send,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  CreditCard
} from "lucide-react"

// Types
interface InvoiceLine {
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

interface Invoice {
  id?: number;
  documentNumber?: string;
  contactId: number;
  contactName?: string;
  salesOrderId?: number;
  salesOrderNumber?: string;
  invoiceDate: string;
  dueDate: string;
  status: 'Draft' | 'AwaitingPayment' | 'Paid' | 'Overdue' | 'Void';
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  amountDue: number;
  paidAmount: number;
  lines?: InvoiceLine[];
  notes?: string;
  createdAt?: string;
}

interface InvoiceStats {
  totalInvoices: number;
  awaitingPayment: number;
  overdue: number;
  totalRevenue: number;
  outstanding: number;
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

interface SalesOrder {
  id: number;
  documentNumber: string;
  contactId: number;
  contactName: string;
  status: string;
  totalAmount: number;
}

export default function SaleInvoicesPage() {
  // State management
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [stats, setStats] = useState<InvoiceStats>({
    totalInvoices: 0,
    awaitingPayment: 0,
    overdue: 0,
    totalRevenue: 0,
    outstanding: 0
  })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  
  // Form state
  const [invoiceForm, setInvoiceForm] = useState<{
    contactId: number | null;
    salesOrderId: number | null;
    invoiceDate: string;
    dueDate: string;
    notes: string;
    lines: InvoiceLine[];
  }>({
    contactId: null,
    salesOrderId: null,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
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

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: ''
  })

  const { toast } = useToast()

  // Load data
  const loadInvoices = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      const mockInvoices: Invoice[] = [
        {
          id: 1,
          documentNumber: "INV-001",
          contactId: 1,
          contactName: "Acme Corp",
          salesOrderId: 1,
          salesOrderNumber: "SO-001",
          invoiceDate: "2025-01-15",
          dueDate: "2025-02-14",
          status: "AwaitingPayment",
          subtotal: 5000.00,
          totalTax: 900.00,
          totalAmount: 5900.00,
          amountDue: 5900.00,
          paidAmount: 0.00,
          createdAt: "2025-01-15T10:30:00Z"
        },
        {
          id: 2,
          documentNumber: "INV-002",
          contactId: 2,
          contactName: "Tech Solutions Inc",
          invoiceDate: "2025-01-10",
          dueDate: "2025-01-20",
          status: "Overdue",
          subtotal: 3500.00,
          totalTax: 630.00,
          totalAmount: 4130.00,
          amountDue: 2130.00,
          paidAmount: 2000.00,
          createdAt: "2025-01-10T14:20:00Z"
        },
        {
          id: 3,
          documentNumber: "INV-003",
          contactId: 3,
          contactName: "Global Enterprises",
          invoiceDate: "2025-01-12",
          dueDate: "2025-02-11",
          status: "Paid",
          subtotal: 7500.00,
          totalTax: 1350.00,
          totalAmount: 8850.00,
          amountDue: 0.00,
          paidAmount: 8850.00,
          createdAt: "2025-01-12T16:45:00Z"
        }
      ]
      
      setInvoices(mockInvoices)
      setFilteredInvoices(mockInvoices)
      
      // Calculate stats
      const stats = {
        totalInvoices: mockInvoices.length,
        awaitingPayment: mockInvoices.filter(i => i.status === 'AwaitingPayment').length,
        overdue: mockInvoices.filter(i => i.status === 'Overdue').length,
        totalRevenue: mockInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
        outstanding: mockInvoices.reduce((sum, i) => sum + i.amountDue, 0)
      }
      setStats(stats)
      
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast({
        title: "Error",
        description: "Failed to load invoices",
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

  const loadSalesOrders = async () => {
    try {
      // TODO: Replace with actual API call
      const mockOrders: SalesOrder[] = [
        { id: 1, documentNumber: "SO-001", contactId: 1, contactName: "Acme Corp", status: "Confirmed", totalAmount: 5900.00 },
        { id: 2, documentNumber: "SO-002", contactId: 2, contactName: "Tech Solutions Inc", status: "Confirmed", totalAmount: 4130.00 }
      ]
      setSalesOrders(mockOrders)
    } catch (error) {
      console.error('Error loading sales orders:', error)
    }
  }

  // Search and filter
  useEffect(() => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredInvoices(filtered)
  }, [searchTerm, statusFilter, invoices])

  // Form utilities
  const addInvoiceLine = () => {
    setInvoiceForm(prev => ({
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

  const removeInvoiceLine = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }))
  }

  const updateInvoiceLine = (index: number, field: keyof InvoiceLine, value: any) => {
    setInvoiceForm(prev => {
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

  const calculateInvoiceTotals = () => {
    const subtotal = invoiceForm.lines.reduce((sum, line) => sum + line.subtotal, 0)
    const totalTax = invoiceForm.lines.reduce((sum, line) => sum + line.taxAmount, 0)
    const totalAmount = subtotal + totalTax
    
    return { subtotal, totalTax, totalAmount }
  }

  const resetForm = () => {
    setInvoiceForm({
      contactId: null,
      salesOrderId: null,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

  const handleCreateInvoice = async () => {
    try {
      if (!invoiceForm.contactId || invoiceForm.lines.some(line => !line.productId)) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const totals = calculateInvoiceTotals()
      
      // TODO: Replace with actual API call
      const newInvoice: Invoice = {
        id: Date.now(),
        documentNumber: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        contactId: invoiceForm.contactId,
        contactName: contacts.find(c => c.id === invoiceForm.contactId)?.name,
        salesOrderId: invoiceForm.salesOrderId || undefined,
        salesOrderNumber: salesOrders.find(so => so.id === invoiceForm.salesOrderId)?.documentNumber,
        invoiceDate: invoiceForm.invoiceDate,
        dueDate: invoiceForm.dueDate,
        status: 'Draft',
        subtotal: totals.subtotal,
        totalTax: totals.totalTax,
        totalAmount: totals.totalAmount,
        amountDue: totals.totalAmount,
        paidAmount: 0,
        lines: invoiceForm.lines,
        notes: invoiceForm.notes
      }

      setInvoices(prev => [newInvoice, ...prev])
      setIsCreateDialogOpen(false)
      resetForm()
      
      toast({
        title: "Success",
        description: "Invoice created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      })
    }
  }

  const handleRecordPayment = async () => {
    try {
      if (!selectedInvoice || paymentForm.amount <= 0) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid payment amount",
          variant: "destructive",
        })
        return
      }

      // TODO: Replace with actual API call
      const updatedInvoice = {
        ...selectedInvoice,
        paidAmount: selectedInvoice.paidAmount + paymentForm.amount,
        amountDue: selectedInvoice.amountDue - paymentForm.amount
      }

      if (updatedInvoice.amountDue <= 0) {
        updatedInvoice.status = 'Paid' as const
        updatedInvoice.amountDue = 0
      }

      setInvoices(prev => 
        prev.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv)
      )

      setIsPaymentDialogOpen(false)
      setSelectedInvoice(null)
      setPaymentForm({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        reference: '',
        notes: ''
      })
      
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'AwaitingPayment': return 'bg-yellow-100 text-yellow-800'
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Overdue': return 'bg-red-100 text-red-800'
      case 'Void': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft': return <Clock className="h-4 w-4" />
      case 'AwaitingPayment': return <AlertCircle className="h-4 w-4" />
      case 'Paid': return <CheckCircle className="h-4 w-4" />
      case 'Overdue': return <XCircle className="h-4 w-4" />
      case 'Void': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const openPaymentDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentForm(prev => ({
      ...prev,
      amount: invoice.amountDue
    }))
    setIsPaymentDialogOpen(true)
  }

  useEffect(() => {
    loadInvoices()
    loadContacts()
    loadProducts()
    loadSalesOrders()
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
                <p className="mt-2 text-muted-foreground">Loading invoices...</p>
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
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Sale Invoices</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Create and manage customer invoices
                </p>
              </div>
            </div>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                    <div className="text-lg sm:text-2xl font-bold">{stats.totalInvoices}</div>
                  </div>
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Awaiting Payment</p>
                    <div className="text-lg sm:text-2xl font-bold">{stats.awaitingPayment}</div>
                  </div>
                  <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                    <div className="text-lg sm:text-2xl font-bold">{stats.overdue}</div>
                  </div>
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
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
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                    <div className="text-lg sm:text-2xl font-bold">₹{stats.outstanding.toLocaleString()}</div>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
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
                      placeholder="Search invoices by number or customer..."
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
                      <SelectItem value="awaitingpayment">Awaiting Payment</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="void">Void</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                View and manage all your customer invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "No invoices found matching your criteria" 
                      : "No invoices found. Create your first invoice to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Invoice #</TableHead>
                        <TableHead className="min-w-[150px]">Customer</TableHead>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[100px]">Due Date</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px] text-right">Amount</TableHead>
                        <TableHead className="min-w-[120px] text-right">Amount Due</TableHead>
                        <TableHead className="min-w-[150px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.documentNumber}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{invoice.contactName}</div>
                              {invoice.salesOrderNumber && (
                                <div className="text-sm text-muted-foreground">
                                  From {invoice.salesOrderNumber}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(invoice.status)}`}>
                              {getStatusIcon(invoice.status)}
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{invoice.totalAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={invoice.amountDue > 0 ? "text-orange-600" : "text-green-600"}>
                              ₹{invoice.amountDue.toLocaleString()}
                            </span>
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
                              {invoice.amountDue > 0 && (
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="h-8 px-3"
                                  onClick={() => openPaymentDialog(invoice)}
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay
                                </Button>
                              )}
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

          {/* Create Invoice Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Create a new customer invoice with product details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer and Invoice Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, contactId: parseInt(value) }))}>
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
                    <Label htmlFor="salesOrder">Sales Order (Optional)</Label>
                    <Select onValueChange={(value) => setInvoiceForm(prev => ({ ...prev, salesOrderId: value ? parseInt(value) : null }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Sales Order</SelectItem>
                        {salesOrders.filter(so => so.status === 'Confirmed').map(order => (
                          <SelectItem key={order.id} value={order.id.toString()}>
                            {order.documentNumber} - {order.contactName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">Invoice Date *</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={invoiceForm.invoiceDate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Invoice Lines */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Invoice Lines</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addInvoiceLine}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Line
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {invoiceForm.lines.map((line, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Line {index + 1}</span>
                          {invoiceForm.lines.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeInvoiceLine(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <Label>Product *</Label>
                            <Select onValueChange={(value) => updateInvoiceLine(index, 'productId', parseInt(value))}>
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
                              onChange={(e) => updateInvoiceLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(e) => updateInvoiceLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
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

                  {/* Invoice Totals */}
                  <div className="border-t pt-4">
                    <div className="flex justify-end">
                      <div className="space-y-2 min-w-[200px]">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">₹{calculateInvoiceTotals().subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span className="font-medium">₹{calculateInvoiceTotals().totalTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 font-bold">
                          <span>Total:</span>
                          <span>₹{calculateInvoiceTotals().totalAmount.toFixed(2)}</span>
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
                    placeholder="Add any additional notes for this invoice..."
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice} className="w-full sm:w-auto">
                  Create Invoice
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogDescription>
                  Record a payment for invoice {selectedInvoice?.documentNumber}
                </DialogDescription>
              </DialogHeader>

              {selectedInvoice && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Invoice Total:</span>
                      <span className="font-medium">₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Amount:</span>
                      <span className="font-medium">₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Amount Due:</span>
                      <span>₹{selectedInvoice.amountDue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount *</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      step="0.01"
                      max={selectedInvoice.amountDue}
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      placeholder="Transaction reference or check number"
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentNotes">Notes</Label>
                    <Textarea
                      id="paymentNotes"
                      placeholder="Additional notes about this payment..."
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleRecordPayment} className="w-full sm:w-auto">
                  Record Payment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
