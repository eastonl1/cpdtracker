"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Plus, Settings, Eye, Loader2, Calendar } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ComplianceChart } from "@/components/compliance-chart"
import { YearGoalManager } from "@/components/year-goal-manager"
import { useAuth } from "@/hooks/useAuth"
import { getYearlyCompliance, getAvailableYears } from "@/lib/compliance"
import type { ComplianceData } from "@/lib/compliance"
import { supabase } from "@/lib/supabase"

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [compliance, setCompliance] = useState<ComplianceData | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [currentGoal, setCurrentGoal] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
      return
    }

    if (user && profile) {
      loadDashboardData()
    }
    // eslint-disable-next-line
  }, [user, profile, authLoading, router, selectedYear])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load available years
      const years = await getAvailableYears(user.id)
      setAvailableYears(years)

      // If selected year is not in available years, use the most recent year
      const yearToUse = years.includes(selectedYear) ? selectedYear : years[0]
      if (yearToUse !== selectedYear) {
        setSelectedYear(yearToUse)
        return // This will trigger useEffect again with the correct year
      }

      // Load compliance data for selected year
      const complianceData = await getYearlyCompliance(user.id, selectedYear)
      setCompliance(complianceData)
      setCurrentGoal(complianceData.goal)

      // Load recent logs for selected year
      const startDate = `${selectedYear}-01-01`
      const endDate = `${selectedYear}-12-31`

      const { data: logsData } = await supabase
        .from("cpd_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })
        .limit(5)

      setLogs(logsData || [])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoalUpdated = () => {
    loadDashboardData()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user || !profile || !compliance) {
    return null
  }

  const userName =
    profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.email

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Remove container here, since it's now in RootLayout */}
      <div className="py-3 space-y-2">
        {/* Header with Year Selection */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}</h1>
            <p className="text-gray-600">Your CPD compliance progress for {selectedYear}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Compliance Charts */}
            <ComplianceChart compliance={compliance} />

            {/* Recent Logs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent CPD Logs ({selectedYear})</CardTitle>
                  <CardDescription>Your latest continuing education activities</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/logs">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {logs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Attachment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                          <TableCell>{log.hours}</TableCell>
                          <TableCell>
                            <Badge variant={log.category === "Priority" ? "default" : "secondary"}>
                              {log.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.attachment_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={log.attachment_url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No CPD logs for {selectedYear}</p>
                    <p className="text-sm">Start tracking your professional development!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Year Goal Manager */}
            <YearGoalManager
              userId={user.id}
              year={selectedYear}
              currentGoal={currentGoal}
              onGoalUpdated={handleGoalUpdated}
            />

            {/* Compliance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Status:</span>
                  <Badge variant={compliance.isCompliant ? "default" : "secondary"}>
                    {compliance.isCompliant ? "Compliant" : "In Progress"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Hours Needed:</span>
                  <span className="font-medium">{Math.max(0, compliance.goal - compliance.totalCountedHours)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Supplementary Limit:</span>
                  <span className="font-medium">
                    {compliance.supplementaryCountedHours} / {compliance.supplementaryLimit}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/add-log">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Log
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <Link href="/logs">
                    <FileText className="w-4 h-4 mr-2" />
                    View All Logs
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
