"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { paymentsApi, invoicesApi, contactsApi, Payment, Invoice, Contact } from "@/lib/api"
import { 
  Receipt, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText
} from "lucide-react"

// Types matching the API
interface PaymentAllocation {
  invoiceId: number;
  invoiceNumber: string;
  allocatedAmount: number;
  invoiceBalance: number;
}

interface PaymentReceipt {
  id?: number;
  paymentNumber?: string;
  contactId: number;
  contactName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  status: 'pending' | 'cleared' | 'bounced';
  bankAccount?: string;
  allocations?: PaymentAllocation[];
  notes?: string;
  createdAt?: string;
}

interface ReceiptStats {
  totalReceipts: number;
  pendingReceipts: number;
  totalAmount: number;
  thisMonth: number;
}

export default function SaleReceiptsPage() {
  // State management
  const [receipts, setReceipts] = useState<Payment[]>([])
  const [filteredReceipts, setFilteredReceipts] = useState<Payment[]>([])
  const [stats, setStats] = useState<ReceiptStats>({
    totalReceipts: 0,
    pendingReceipts: 0,
    totalAmount: 0,
    thisMonth: 0
  })
  const [contacts, setContacts] = useState<Contact[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedContactInvoices, setSelectedContactInvoices] = useState<Invoice[]>([])
  
  // Form state
  const [receiptForm, setReceiptForm] = useState<{
    contactId: number | null;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference: string;
    bankAccount: string;
    notes: string;
    allocations: PaymentAllocation[];
  }>({
    contactId: null,
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    reference: '',
    bankAccount: '',
    notes: '',
    allocations: []
  })

  const { toast } = useToast()

  // Load data
  const loadReceipts = async () => {
    try {
      setLoading(true)
      const response = await paymentsApi.getAll({ type: 'received' })
      
      if (response.success && response.data) {
        setReceipts(response.data.payments)
        setFilteredReceipts(response.data.payments)
      }
      
    } catch (error) {
      console.error('Error loading receipts:', error)
      toast({
        title: "Error",
        description: "Failed to load payment receipts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await paymentsApi.getStatistics()
      
      if (response.success && response.data) {
        setStats({
          totalReceipts: response.data.totalPayments,
          pendingReceipts: response.data.unallocatedPayments,
          totalAmount: response.data.totalReceived,
          thisMonth: response.data.thisMonthReceived
        })
      }
      
    } catch (error) {
      console.error('Error loading payment statistics:', error)
    }
  }

  const loadContacts = async () => {
    try {
      const response = await contactsApi.getAll({ contactType: 'customer' })
      
      if (response.success && response.data) {
        setContacts(response.data.contacts)
      }
      
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadInvoices = async () => {
    try {
      const response = await invoicesApi.getAll({ status: 'sent,partial' })
      
      if (response.success && response.data) {
        setInvoices(response.data.invoices)
      }
      
    } catch (error) {
      console.error('Error loading invoices:', error)
    }
  }

  // Search and filter
  useEffect(() => {
    let filtered = receipts

    if (searchTerm) {
      filtered = filtered.filter(receipt => 
        receipt.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      // Map frontend filter values to actual payment statuses
      if (statusFilter === "pending") {
        filtered = filtered.filter(receipt => !receipt.allocations || receipt.allocations.length === 0)
      } else if (statusFilter === "cleared") {
        filtered = filtered.filter(receipt => receipt.allocations && receipt.allocations.length > 0)
      }
      // Note: "bounced" status would need to be added to the backend Payment model
    }

    setFilteredReceipts(filtered)
  }, [searchTerm, statusFilter, receipts])

  // Load customer invoices when contact is selected
  useEffect(() => {
    const loadContactInvoices = async () => {
      if (receiptForm.contactId) {
        try {
          const response = await paymentsApi.getOutstandingInvoicesByContact(receiptForm.contactId)
          
          if (response.success && response.data) {
            setSelectedContactInvoices(response.data)
            
            // Auto-allocate payment to oldest invoice
            if (response.data.length > 0 && receiptForm.amount > 0) {
              const allocations: PaymentAllocation[] = []
              let remainingAmount = receiptForm.amount
              
              for (const invoice of response.data) {
                if (remainingAmount <= 0) break
                
                const amountDue = invoice.totalAmount - invoice.paidAmount
                const allocatedAmount = Math.min(remainingAmount, amountDue)
                allocations.push({
                  invoiceId: invoice.id!,
                  invoiceNumber: invoice.invoiceNumber!,
                  allocatedAmount,
                  invoiceBalance: amountDue - allocatedAmount
                })
                remainingAmount -= allocatedAmount
              }
              
              setReceiptForm(prev => ({ ...prev, allocations }))
            }
          }
        } catch (error) {
          console.error('Error loading contact invoices:', error)
        }
      } else {
        setSelectedContactInvoices([])
        setReceiptForm(prev => ({ ...prev, allocations: [] }))
      }
    }
    
    loadContactInvoices()
  }, [receiptForm.contactId, receiptForm.amount])

  const updateAllocation = (invoiceId: number, amount: number) => {
    setReceiptForm(prev => {
      const newAllocations = prev.allocations.map(alloc => {
        if (alloc.invoiceId === invoiceId) {
          const invoice = selectedContactInvoices.find(inv => inv.id === invoiceId)
          const amountDue = invoice ? invoice.totalAmount - invoice.paidAmount : 0
          return {
            ...alloc,
            allocatedAmount: Math.min(amount, amountDue),
            invoiceBalance: amountDue - Math.min(amount, amountDue)
          }
        }
        return alloc
      })
      return { ...prev, allocations: newAllocations }
    })
  }

  const getTotalAllocated = () => {
    return receiptForm.allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0)
  }

  const getUnallocatedAmount = () => {
    return receiptForm.amount - getTotalAllocated()
  }

  const resetForm = () => {
    setReceiptForm({
      contactId: null,
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'bank_transfer',
      reference: '',
      bankAccount: '',
      notes: '',
      allocations: []
    })
    setSelectedContactInvoices([])
  }

  const handleCreateReceipt = async () => {
    try {
      if (!receiptForm.contactId || receiptForm.amount <= 0) {
        toast({
          title: "Validation Error",
          description: "Please select a customer and enter a valid amount",
          variant: "destructive",
        })
        return
      }

      const paymentData = {
        contactId: receiptForm.contactId,
        amount: receiptForm.amount,
        paymentDate: receiptForm.paymentDate,
        paymentMethod: receiptForm.paymentMethod,
        reference: receiptForm.reference,
        notes: receiptForm.notes,
        type: 'received' as const,
        allocations: receiptForm.allocations.map(alloc => ({
          invoiceId: alloc.invoiceId,
          amount: alloc.allocatedAmount
        }))
      }

      const response = await paymentsApi.create(paymentData)
      
      if (response.success) {
        await loadReceipts()
        await loadStats()
        setIsCreateDialogOpen(false)
        resetForm()
        
        toast({
          title: "Success",
          description: "Payment receipt created successfully",
        })
      } else {
        throw new Error(response.message || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create payment receipt",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (payment: Payment) => {
    // Determine status based on allocations
    if (!payment.allocations || payment.allocations.length === 0) {
      return 'bg-yellow-100 text-yellow-800' // Pending/Unallocated
    }
    return 'bg-green-100 text-green-800' // Allocated/Cleared
  }

  const getStatusIcon = (payment: Payment) => {
    if (!payment.allocations || payment.allocations.length === 0) {
      return <Clock className="h-4 w-4" />
    }
    return <CheckCircle className="h-4 w-4" />
  }

  const getStatusText = (payment: Payment) => {
    if (!payment.allocations || payment.allocations.length === 0) {
      return 'Unallocated'
    }
    return 'Allocated'
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash': return '💵'
      case 'bank_transfer': return '🏦'
      case 'credit_card': return '💳'
      case 'check': return '📄'
      case 'upi': return '📱'
      default: return '💰'
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadReceipts(),
        loadStats(),
        loadContacts(),
        loadInvoices()
      ])
    }
    
    loadData()
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
                <p className="mt-2 text-muted-foreground">Loading payment receipts...</p>
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
              <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Payment Receipts</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track customer payments and receipts
                </p>
              </div>
            </div>
            <Button 
              className="w-full sm:w-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Receipt
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Receipts</p>
                    <div className="text-lg sm:text-2xl font-bold">{stats.totalReceipts}</div>
                  </div>
                  <Receipt className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <div className="text-lg sm:text-2xl font-bold">{stats.pendingReceipts}</div>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <div className="text-lg sm:text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <div className="text-lg sm:text-2xl font-bold">₹{stats.thisMonth.toLocaleString()}</div>
                  </div>
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
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
                      placeholder="Search receipts by number, customer, or reference..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cleared">Cleared</SelectItem>
                      <SelectItem value="bounced">Bounced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Receipts</CardTitle>
              <CardDescription>
                View and manage all customer payment receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReceipts.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" 
                      ? "No receipts found matching your criteria" 
                      : "No payment receipts found. Record your first payment receipt to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Receipt #</TableHead>
                        <TableHead className="min-w-[150px]">Customer</TableHead>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[120px]">Method</TableHead>
                        <TableHead className="min-w-[120px]">Reference</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px] text-right">Amount</TableHead>
                        <TableHead className="min-w-[120px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">
                            PAY-{String(receipt.id).padStart(6, '0')}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{receipt.contact?.name || 'Unknown'}</div>
                              {receipt.allocations && receipt.allocations.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  {receipt.allocations.map(alloc => alloc.invoice?.invoiceNumber).filter(Boolean).join(', ')}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(receipt.paymentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{getPaymentMethodIcon(receipt.paymentMethod)}</span>
                              <span className="text-sm">{receipt.paymentMethod.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {receipt.reference || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(receipt)}`}>
                              {getStatusIcon(receipt)}
                              {getStatusText(receipt)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{receipt.amount.toLocaleString()}
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

          {/* Create Receipt Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record New Payment Receipt</DialogTitle>
                <DialogDescription>
                  Record a new customer payment and allocate it to outstanding invoices.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select onValueChange={(value) => setReceiptForm(prev => ({ ...prev, contactId: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.filter(c => c.contactType === 'Customer' || c.contactType === 'Both').map(contact => (
                          <SelectItem key={contact.id} value={contact.id!.toString()}>
                            {contact.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={receiptForm.amount}
                      onChange={(e) => setReceiptForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date *</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={receiptForm.paymentDate}
                      onChange={(e) => setReceiptForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={receiptForm.paymentMethod} onValueChange={(value) => setReceiptForm(prev => ({ ...prev, paymentMethod: value }))}>
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
                      value={receiptForm.reference}
                      onChange={(e) => setReceiptForm(prev => ({ ...prev, reference: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Bank Account</Label>
                    <Input
                      id="bankAccount"
                      placeholder="Bank account where payment was received"
                      value={receiptForm.bankAccount}
                      onChange={(e) => setReceiptForm(prev => ({ ...prev, bankAccount: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Invoice Allocations */}
                {selectedContactInvoices.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Payment Allocation</Label>
                      <div className="text-sm text-muted-foreground">
                        Unallocated: ₹{getUnallocatedAmount().toFixed(2)}
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                            <TableHead className="text-right">Amount Due</TableHead>
                            <TableHead className="text-right">Allocate</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receiptForm.allocations.map((allocation) => {
                            const invoice = selectedContactInvoices.find(inv => inv.id === allocation.invoiceId)
                            const amountDue = invoice ? invoice.totalAmount - invoice.paidAmount : 0
                            
                            return (
                            <TableRow key={allocation.invoiceId}>
                              <TableCell className="font-medium">
                                {allocation.invoiceNumber}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{invoice?.totalAmount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{amountDue.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={amountDue}
                                  value={allocation.allocatedAmount}
                                  onChange={(e) => updateAllocation(allocation.invoiceId, parseFloat(e.target.value) || 0)}
                                  className="w-24 text-right"
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{allocation.invoiceBalance.toFixed(2)}
                              </TableCell>
                            </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-end">
                      <div className="space-y-2 min-w-[200px]">
                        <div className="flex justify-between">
                          <span>Payment Amount:</span>
                          <span className="font-medium">₹{receiptForm.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Allocated:</span>
                          <span className="font-medium">₹{getTotalAllocated().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span>Unallocated:</span>
                          <span className={`font-medium ${getUnallocatedAmount() > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            ₹{getUnallocatedAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes for this payment..."
                    value={receiptForm.notes}
                    onChange={(e) => setReceiptForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleCreateReceipt} className="w-full sm:w-auto">
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
