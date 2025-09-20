"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DollarSign, TrendingUp, FileText, AlertCircle, Calendar, Users, Target, Clock } from "lucide-react"

const kpiData = [
  {
    title: "Total Sales",
    value: "$15,500",
    change: "8% increase from last month",
    icon: DollarSign,
    trend: "up",
    details: {
      description: "Total revenue generated from all sales transactions",
      breakdown: [
        { label: "Product Sales", value: "$12,400", percentage: "80%" },
        { label: "Service Revenue", value: "$2,100", percentage: "13.5%" },
        { label: "Other Income", value: "$1,000", percentage: "6.5%" },
      ],
      metrics: [
        { icon: Calendar, label: "This Month", value: "$15,500" },
        { icon: Users, label: "Active Customers", value: "127" },
        { icon: Target, label: "Monthly Goal", value: "$18,000" },
        { icon: Clock, label: "Last Updated", value: "2 hours ago" },
      ],
    },
  },
  {
    title: "Net Profit",
    value: "$4,200",
    change: "On track for this quarter",
    icon: TrendingUp,
    trend: "up",
    details: {
      description: "Net profit after deducting all expenses and taxes",
      breakdown: [
        { label: "Gross Profit", value: "$8,500", percentage: "100%" },
        { label: "Operating Expenses", value: "$3,200", percentage: "37.6%" },
        { label: "Taxes", value: "$1,100", percentage: "12.9%" },
      ],
      metrics: [
        { icon: TrendingUp, label: "Profit Margin", value: "27.1%" },
        { icon: Target, label: "Quarterly Goal", value: "$15,000" },
        { icon: Calendar, label: "YTD Profit", value: "$38,400" },
        { icon: Clock, label: "Last Calculated", value: "1 hour ago" },
      ],
    },
  },
  {
    title: "Outstanding Receivables",
    value: "$8,300",
    change: "3 overdue invoices",
    icon: FileText,
    trend: "neutral",
    details: {
      description: "Total amount pending collection from customers",
      breakdown: [
        { label: "0-30 days", value: "$5,200", percentage: "62.7%" },
        { label: "31-60 days", value: "$2,100", percentage: "25.3%" },
        { label: "60+ days (Overdue)", value: "$1,000", percentage: "12%" },
      ],
      metrics: [
        { icon: FileText, label: "Total Invoices", value: "23" },
        { icon: AlertCircle, label: "Overdue Invoices", value: "3" },
        { icon: Users, label: "Customers Owing", value: "15" },
        { icon: Clock, label: "Avg Collection Time", value: "28 days" },
      ],
    },
  },
  {
    title: "Outstanding Payables",
    value: "$2,100",
    change: "Due in next 7 days",
    icon: AlertCircle,
    trend: "neutral",
    details: {
      description: "Total amount owed to suppliers and vendors",
      breakdown: [
        { label: "Due within 7 days", value: "$1,200", percentage: "57.1%" },
        { label: "Due within 30 days", value: "$700", percentage: "33.3%" },
        { label: "Due later", value: "$200", percentage: "9.5%" },
      ],
      metrics: [
        { icon: FileText, label: "Total Bills", value: "8" },
        { icon: AlertCircle, label: "Urgent Payments", value: "3" },
        { icon: Users, label: "Vendors", value: "6" },
        { icon: Clock, label: "Avg Payment Time", value: "15 days" },
      ],
    },
  },
]

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {kpiData.map((kpi, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <Card
              className="bg-card hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out transform hover:-translate-y-1 cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground transition-colors duration-200">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl sm:text-2xl font-bold text-card-foreground transition-colors duration-200">
                  {kpi.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-tight transition-colors duration-200">
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <kpi.icon className="h-5 w-5" />
                {kpi.title} Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Current Value */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-card-foreground">{kpi.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{kpi.change}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Overview</h3>
                <p className="text-sm text-muted-foreground">{kpi.details.description}</p>
              </div>

              {/* Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Breakdown</h3>
                <div className="space-y-2">
                  {kpi.details.breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">{item.label}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{item.value}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Metrics */}
              <div>
                <h3 className="font-semibold mb-3">Additional Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {kpi.details.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <metric.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">{metric.label}</div>
                        <div className="text-sm font-semibold truncate">{metric.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
