"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Calendar, User, DollarSign, FileText, MapPin, Phone, Mail } from "lucide-react"

const recentSalesOrders = [
  {
    id: "SO-001",
    customer: "ABC Corp",
    date: "2024-01-15",
    amount: "$2,500",
    status: "Pending",
    details: {
      customerInfo: {
        name: "ABC Corp",
        email: "contact@abccorp.com",
        phone: "+1 (555) 123-4567",
        address: "123 Business St, New York, NY 10001",
      },
      orderInfo: {
        orderDate: "2024-01-15",
        dueDate: "2024-01-30",
        paymentTerms: "Net 30",
        salesRep: "John Smith",
      },
      items: [
        { name: "Product A", quantity: 10, unitPrice: "$150", total: "$1,500" },
        { name: "Product B", quantity: 5, unitPrice: "$200", total: "$1,000" },
      ],
      totals: {
        subtotal: "$2,500",
        tax: "$200",
        total: "$2,700",
      },
    },
  },
  {
    id: "SO-002",
    customer: "XYZ Ltd",
    date: "2024-01-14",
    amount: "$1,800",
    status: "Completed",
    details: {
      customerInfo: {
        name: "XYZ Ltd",
        email: "orders@xyzltd.com",
        phone: "+1 (555) 987-6543",
        address: "456 Commerce Ave, Los Angeles, CA 90210",
      },
      orderInfo: {
        orderDate: "2024-01-14",
        dueDate: "2024-01-28",
        paymentTerms: "Net 15",
        salesRep: "Sarah Johnson",
      },
      items: [{ name: "Service Package", quantity: 1, unitPrice: "$1,800", total: "$1,800" }],
      totals: {
        subtotal: "$1,800",
        tax: "$144",
        total: "$1,944",
      },
    },
  },
  {
    id: "SO-003",
    customer: "Tech Solutions",
    date: "2024-01-13",
    amount: "$3,200",
    status: "Processing",
    details: {
      customerInfo: {
        name: "Tech Solutions Inc",
        email: "procurement@techsolutions.com",
        phone: "+1 (555) 456-7890",
        address: "789 Innovation Dr, San Francisco, CA 94105",
      },
      orderInfo: {
        orderDate: "2024-01-13",
        dueDate: "2024-02-12",
        paymentTerms: "Net 30",
        salesRep: "Mike Davis",
      },
      items: [
        { name: "Software License", quantity: 2, unitPrice: "$1,200", total: "$2,400" },
        { name: "Support Package", quantity: 1, unitPrice: "$800", total: "$800" },
      ],
      totals: {
        subtotal: "$3,200",
        tax: "$256",
        total: "$3,456",
      },
    },
  },
  {
    id: "SO-004",
    customer: "Global Inc",
    date: "2024-01-12",
    amount: "$950",
    status: "Completed",
    details: {
      customerInfo: {
        name: "Global Inc",
        email: "billing@globalinc.com",
        phone: "+1 (555) 321-0987",
        address: "321 Corporate Blvd, Chicago, IL 60601",
      },
      orderInfo: {
        orderDate: "2024-01-12",
        dueDate: "2024-01-26",
        paymentTerms: "Net 14",
        salesRep: "Lisa Chen",
      },
      items: [{ name: "Consulting Hours", quantity: 5, unitPrice: "$190", total: "$950" }],
      totals: {
        subtotal: "$950",
        tax: "$76",
        total: "$1,026",
      },
    },
  },
]

const recentPayments = [
  {
    invoice: "INV-001",
    customer: "ABC Corp",
    amount: "$2,500",
    date: "2024-01-15",
    details: {
      paymentInfo: {
        paymentDate: "2024-01-15",
        paymentMethod: "Bank Transfer",
        reference: "TXN-ABC-001",
        status: "Cleared",
      },
      invoiceInfo: {
        invoiceDate: "2024-01-01",
        dueDate: "2024-01-31",
        originalAmount: "$2,700",
        paidAmount: "$2,500",
        remainingBalance: "$200",
      },
    },
  },
  {
    invoice: "INV-002",
    customer: "XYZ Ltd",
    amount: "$1,800",
    date: "2024-01-14",
    details: {
      paymentInfo: {
        paymentDate: "2024-01-14",
        paymentMethod: "Credit Card",
        reference: "CC-XYZ-002",
        status: "Cleared",
      },
      invoiceInfo: {
        invoiceDate: "2023-12-30",
        dueDate: "2024-01-14",
        originalAmount: "$1,944",
        paidAmount: "$1,800",
        remainingBalance: "$144",
      },
    },
  },
  {
    invoice: "INV-003",
    customer: "Tech Solutions",
    amount: "$1,600",
    date: "2024-01-13",
    details: {
      paymentInfo: {
        paymentDate: "2024-01-13",
        paymentMethod: "Check",
        reference: "CHK-TECH-003",
        status: "Pending",
      },
      invoiceInfo: {
        invoiceDate: "2023-12-28",
        dueDate: "2024-01-27",
        originalAmount: "$3,456",
        paidAmount: "$1,600",
        remainingBalance: "$1,856",
      },
    },
  },
  {
    invoice: "INV-004",
    customer: "Global Inc",
    amount: "$950",
    date: "2024-01-12",
    details: {
      paymentInfo: {
        paymentDate: "2024-01-12",
        paymentMethod: "Bank Transfer",
        reference: "TXN-GLB-004",
        status: "Cleared",
      },
      invoiceInfo: {
        invoiceDate: "2023-12-29",
        dueDate: "2024-01-12",
        originalAmount: "$1,026",
        paidAmount: "$950",
        remainingBalance: "$76",
      },
    },
  },
]

export function DataTables() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      {/* Recent Sales Orders */}
      <Card className="w-full hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] animate-in fade-in-50 slide-in-from-left-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">Recent Sales Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {recentSalesOrders.map((order, index) => (
              <Sheet key={order.id}>
                <SheetTrigger asChild>
                  <div
                    className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg hover:bg-muted/80 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02] animate-in fade-in-50 slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium truncate transition-colors duration-200">{order.id}</p>
                      <p className="text-xs text-muted-foreground truncate transition-colors duration-200">
                        {order.customer}
                      </p>
                      <p className="text-xs text-muted-foreground transition-colors duration-200">{order.date}</p>
                    </div>
                    <div className="text-right space-y-1 flex-shrink-0 ml-3">
                      <p className="text-sm font-medium transition-colors duration-200">{order.amount}</p>
                      <Badge
                        variant={order.status === "Completed" ? "default" : "secondary"}
                        className="text-xs transition-all duration-200 hover:scale-105"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Sales Order {order.id}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{order.details.customerInfo.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{order.details.customerInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{order.details.customerInfo.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{order.details.customerInfo.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Information */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Order Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Order Date:</span>
                          <div className="font-medium">{order.details.orderInfo.orderDate}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Due Date:</span>
                          <div className="font-medium">{order.details.orderInfo.dueDate}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Payment Terms:</span>
                          <div className="font-medium">{order.details.orderInfo.paymentTerms}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sales Rep:</span>
                          <div className="font-medium">{order.details.orderInfo.salesRep}</div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {order.details.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × {item.unitPrice}
                              </div>
                            </div>
                            <div className="font-semibold">{item.total}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">{order.details.totals.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span className="font-medium">{order.details.totals.tax}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base border-t pt-2">
                          <span>Total:</span>
                          <span>{order.details.totals.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card className="w-full hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {recentPayments.map((payment, index) => (
              <Sheet key={payment.invoice}>
                <SheetTrigger asChild>
                  <div
                    className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg hover:bg-muted/80 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02] animate-in fade-in-50 slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-medium truncate transition-colors duration-200">{payment.invoice}</p>
                      <p className="text-xs text-muted-foreground truncate transition-colors duration-200">
                        {payment.customer}
                      </p>
                      <p className="text-xs text-muted-foreground transition-colors duration-200">{payment.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-medium text-green-600 transition-colors duration-200">
                        {payment.amount}
                      </p>
                    </div>
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Payment {payment.invoice}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    {/* Payment Information */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Payment Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Payment Date:</span>
                          <div className="font-medium">{payment.details.paymentInfo.paymentDate}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Method:</span>
                          <div className="font-medium">{payment.details.paymentInfo.paymentMethod}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reference:</span>
                          <div className="font-medium">{payment.details.paymentInfo.reference}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={payment.details.paymentInfo.status === "Cleared" ? "default" : "secondary"}>
                            {payment.details.paymentInfo.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Information */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Invoice Information
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Invoice Date:</span>
                          <div className="font-medium">{payment.details.invoiceInfo.invoiceDate}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Due Date:</span>
                          <div className="font-medium">{payment.details.invoiceInfo.dueDate}</div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Payment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Original Amount:</span>
                          <span className="font-medium">{payment.details.invoiceInfo.originalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paid Amount:</span>
                          <span className="font-medium text-green-600">{payment.details.invoiceInfo.paidAmount}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base border-t pt-2">
                          <span>Remaining Balance:</span>
                          <span
                            className={
                              payment.details.invoiceInfo.remainingBalance === "$0"
                                ? "text-green-600"
                                : "text-orange-600"
                            }
                          >
                            {payment.details.invoiceInfo.remainingBalance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
