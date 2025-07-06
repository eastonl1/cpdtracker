"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { ComplianceData } from "@/lib/compliance"

interface ComplianceChartProps {
  compliance: ComplianceData
}

export function ComplianceChart({ compliance }: ComplianceChartProps) {
  const pieData = [
    {
      name: "Priority Hours",
      value: compliance.priorityHours,
      color: "#3b82f6",
      counted: compliance.priorityHours,
    },
    {
      name: "Supplementary (Counted)",
      value: compliance.supplementaryCountedHours,
      color: "#10b981",
      counted: compliance.supplementaryCountedHours,
    },
    {
      name: "Supplementary (Excess)",
      value: compliance.supplementaryHours - compliance.supplementaryCountedHours,
      color: "#6b7280",
      counted: 0,
    },
  ].filter((item) => item.value > 0)

  const barData = [
    {
      name: "Progress",
      completed: compliance.totalCountedHours,
      remaining: Math.max(0, compliance.goal - compliance.totalCountedHours),
      goal: compliance.goal,
    },
  ]

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Compliance Progress
            <Badge variant={compliance.isCompliant ? "default" : "secondary"}>
              {compliance.isCompliant ? "Compliant" : "In Progress"}
            </Badge>
          </CardTitle>
          <CardDescription>{compliance.year} CPD compliance tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {compliance.totalCountedHours} / {compliance.goal} hours
              </span>
            </div>
            <Progress value={Math.min(compliance.progressPercentage, 100)} className="h-3" />
            <div className="text-xs text-gray-600 text-center">
              {Math.round(compliance.progressPercentage)}% complete
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Priority Hours:</span>
              <span className="font-medium">{compliance.priorityHours}</span>
            </div>
            <div className="flex justify-between">
              <span>Supplementary Hours (Counted):</span>
              <span className="font-medium">
                {compliance.supplementaryCountedHours} / {compliance.supplementaryLimit}
              </span>
            </div>
            {compliance.supplementaryHours > compliance.supplementaryCountedHours && (
              <div className="flex justify-between text-gray-500">
                <span>Supplementary Hours (Excess):</span>
                <span>{compliance.supplementaryHours - compliance.supplementaryCountedHours}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hours Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Hours Breakdown</CardTitle>
          <CardDescription>Distribution of your CPD activities</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} hours`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No CPD hours logged for {compliance.year}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
