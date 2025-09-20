"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Save, Send, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LineItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export function InvoiceForm() {
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, rate: 0, amount: 0 }])
  const [taxRate, setTaxRate] = useState(18) // Default GST rate for India
  const [showTaxSettings, setShowTaxSettings] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    customer: "",
    invoiceDate: "",
    dueDate: "",
    invoiceNumber: "",
    notes: ""
  })
  const { toast } = useToast()

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0, amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    if (field === "quantity" || field === "rate") {
      updated[index].amount = updated[index].quantity * updated[index].rate
    }
    setLineItems(updated)
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  const handleSaveDraft = () => {
    // Validate required fields
    if (!invoiceData.customer || !invoiceData.invoiceDate || lineItems.some(item => !item.description)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Save as draft logic
    const draftInvoice = {
      ...invoiceData,
      lineItems,
      subtotal,
      tax,
      total,
      status: "draft",
      createdAt: new Date().toISOString()
    }

    // Here you would typically save to your backend
    localStorage.setItem(`draft_invoice_${Date.now()}`, JSON.stringify(draftInvoice))
    
    toast({
      title: "Draft Saved",
      description: "Invoice has been saved as draft successfully",
    })
  }

  const handleSendInvoice = () => {
    // Validate required fields
    if (!invoiceData.customer || !invoiceData.invoiceDate || !invoiceData.dueDate || lineItems.some(item => !item.description)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including due date",
        variant: "destructive"
      })
      return
    }

    // Send invoice logic
    const finalInvoice = {
      ...invoiceData,
      lineItems,
      subtotal,
      tax,
      total,
      status: "sent",
      sentAt: new Date().toISOString()
    }

    // Here you would typically send to your backend and email to customer
    localStorage.setItem(`sent_invoice_${Date.now()}`, JSON.stringify(finalInvoice))
    
    toast({
      title: "Invoice Sent",
      description: "Invoice has been sent to customer successfully",
    })

    // Reset form
    setInvoiceData({
      customer: "",
      invoiceDate: "",
      dueDate: "",
      invoiceNumber: "",
      notes: ""
    })
    setLineItems([{ description: "", quantity: 1, rate: 0, amount: 0 }])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Invoice</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTaxSettings(!showTaxSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Tax Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tax Settings */}
          {showTaxSettings && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Tax Configuration</h4>
                  <div className="flex items-center gap-4">
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-24"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm text-muted-foreground">
                      Common rates: GST 18%, VAT 12%, Service Tax 15%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={invoiceData.customer} onValueChange={(value) => setInvoiceData({...invoiceData, customer: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abc-corp">ABC Corp</SelectItem>
                  <SelectItem value="xyz-ltd">XYZ Ltd</SelectItem>
                  <SelectItem value="tech-solutions">Tech Solutions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-date">Invoice Date *</Label>
              <Input 
                type="date" 
                id="invoice-date" 
                value={invoiceData.invoiceDate}
                onChange={(e) => setInvoiceData({...invoiceData, invoiceDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date *</Label>
              <Input 
                type="date" 
                id="due-date" 
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input 
                id="invoice-number" 
                placeholder="INV-001" 
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Line Items</h3>
              <Button onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 items-center border-b pb-2 font-medium text-sm text-muted-foreground">
              <div className="col-span-5">Description *</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Rate (₹)</div>
              <div className="col-span-2">Amount (₹)</div>
              <div className="col-span-1">Action</div>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => updateLineItem(index, "rate", Number.parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="text"
                      value={`₹${item.amount.toFixed(2)}`}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Additional notes, terms & conditions..." 
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={handleSaveDraft}
              disabled={lineItems.some(item => !item.description) || !invoiceData.customer}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button 
              onClick={handleSendInvoice}
              disabled={lineItems.some(item => !item.description) || !invoiceData.customer || !invoiceData.dueDate}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
