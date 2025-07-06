"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Download, Eye, Loader2, FileText, Edit, Trash2, Calendar } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/hooks/useAuth"
import { deleteCPDLog } from "@/lib/cpd-logs"
import { supabase } from "@/lib/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AllLogsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
      return
    }

    if (user) {
      getYearsFromLogs()
      loadLogs()
    }
  }, [user, authLoading, router, filter, selectedYear])

  const getYearsFromLogs = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from("cpd_logs")
      .select("date")
      .eq("user_id", user.id)

    if (error || !data) return

    const years = Array.from(
  new Set(data.map((entry) => new Date(entry.date as string).getFullYear()))
).sort((a, b) => b - a)

    setAvailableYears(years)
  }

  const loadLogs = async () => {
    if (!user) return

    try {
      setLoading(true)

      const category = filter === "All" ? undefined : (filter as "Priority" | "Supplementary")
      const startDate = `${selectedYear}-01-01`
      const endDate = `${selectedYear}-12-31`

      const { data, error } = await supabase
        .from("cpd_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })

      if (error) throw error

      const filtered = category ? data?.filter((log) => log.category === category) : data
      setLogs(filtered || [])
    } catch (error) {
      console.error("Error loading logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return

    try {
      setIsDeleting(true)
      await deleteCPDLog(id)
      await loadLogs()
      setDeleteId(null)
    } catch (error) {
      console.error("Error deleting log:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All CPD Logs</h1>
            <p className="text-gray-600 mt-1">
              {logs.length} entries • {totalHours} total hours
            </p>
          </div>
          <Button asChild>
            <Link href="/add-log">
              <Plus className="w-4 h-4 mr-2" />
              Add New Log
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>CPD Activity Log</CardTitle>
              <div className="flex items-center space-x-4">
                <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(Number(val))}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Priority">Priority</SelectItem>
                    <SelectItem value="Supplementary">Supplementary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{new Date(log.date).toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={log.description}>
                            {log.description}
                          </div>
                        </TableCell>
                        <TableCell>{log.hours}</TableCell>
                        <TableCell>
                          <Badge
                            variant={log.category === "Priority" ? "default" : "secondary"}
                            className={
                              log.category === "Priority" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {log.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {log.attachment_url && (
                              <>
                                <Button variant="ghost" size="sm" title="View attachment" asChild>
                                  <a href={log.attachment_url} target="_blank" rel="noopener noreferrer">
                                    <Eye className="w-4 h-4" />
                                  </a>
                                </Button>
                                <Button variant="ghost" size="sm" title="Download attachment" asChild>
                                  <a href={log.attachment_url} download={log.attachment_name}>
                                    <Download className="w-4 h-4" />
                                  </a>
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm" title="Edit log" asChild>
                              <Link href={`/edit-log/${log.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" title="Delete log">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete CPD Log</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this CPD log? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(log.id)}
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No CPD logs found</h3>
                <p className="text-sm mb-4">
                  {filter === "All"
                    ? "Start tracking your professional development activities!"
                    : `No ${filter} activities found. Try changing the filter.`}
                </p>
                <Button asChild>
                  <Link href="/add-log">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Log
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
