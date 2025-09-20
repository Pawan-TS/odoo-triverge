"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

const chartData = [
  { month: "Jan", sales: 12000, expenses: 8000 },
  { month: "Feb", sales: 14500, expenses: 9200 },
  { month: "Mar", sales: 13800, expenses: 8800 },
  { month: "Apr", sales: 16200, expenses: 10500 },
  { month: "May", sales: 15500, expenses: 9800 },
  { month: "Jun", sales: 18000, expenses: 11200 },
]

export function SalesChart() {
  return (
    <Card className="w-full hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-[1.02] animate-in fade-in-50 slide-in-from-bottom-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg transition-colors duration-200">
          Monthly Sales vs. Expenses
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm transition-colors duration-200">
          Revenue and expense trends over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-[250px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" fontSize={12} tickMargin={5} />
              <YAxis fontSize={12} tickMargin={5} width={50} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                strokeWidth={2}
                name="Sales"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
