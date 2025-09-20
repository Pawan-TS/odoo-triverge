"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Printer } from "lucide-react"

const plData = {
  revenue: {
    "Sales Revenue": 125000,
    "Service Revenue": 35000,
    "Other Income": 2500,
  },
  expenses: {
    "Cost of Goods Sold": 45000,
    "Salaries & Wages": 35000,
    Rent: 12000,
    Utilities: 3500,
    Marketing: 8000,
    "Office Supplies": 2500,
    Insurance: 4000,
    "Other Expenses": 5000,
  },
}

export function ProfitLossReport() {
  const totalRevenue = Object.values(plData.revenue).reduce((sum, val) => sum + val, 0)
  const totalExpenses = Object.values(plData.expenses).reduce((sum, val) => sum + val, 0)
  const netIncome = totalRevenue - totalExpenses

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
          <p className="text-muted-foreground">January 1, 2024 - December 31, 2024</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2024">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Revenue Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-green-600">Revenue</h2>
            {Object.entries(plData.revenue).map(([item, amount]) => (
              <div key={item} className="flex justify-between items-center py-2 border-b">
                <span className="pl-4">{item}</span>
                <span className="font-medium">${amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 font-semibold text-lg border-t-2">
              <span>Total Revenue</span>
              <span className="text-green-600">${totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold text-red-600">Expenses</h2>
            {Object.entries(plData.expenses).map(([item, amount]) => (
              <div key={item} className="flex justify-between items-center py-2 border-b">
                <span className="pl-4">{item}</span>
                <span className="font-medium">${amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 font-semibold text-lg border-t-2">
              <span>Total Expenses</span>
              <span className="text-red-600">${totalExpenses.toLocaleString()}</span>
            </div>
          </div>

          {/* Net Income */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Net Income</span>
              <span className={`text-xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${netIncome.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{netIncome >= 0 ? "Profit" : "Loss"} for the period</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
