"use client"

import type React from "react"

import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, HelpCircle, Loader2, AlertCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { CategoryModal } from "@/components/category-modal"
import { useAuth } from "@/hooks/useAuth"
import { createCPDLog, uploadAttachment } from "@/lib/cpd-logs"

export default function AddLogPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    hours: "",
    category: "",
    file: null as File | null,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)

    const isoDate = formData.date;

    // Check daily total before proceeding
    const { data: existingLogs, error: fetchError } = await supabase
      .from("cpd_logs")
     .select("hours")
     .eq("user_id", user.id)
     .eq("date", isoDate);

    if (fetchError) {
     throw fetchError;
    }

    const totalForDay = existingLogs?.reduce((sum, log: any) => sum + log.hours, 0) ?? 0;
    const newHours = Number.parseFloat(formData.hours);

    if (totalForDay + newHours > 24) {
      setError("You are exceeding 24 CPD hours in one day. Please adjust.");
     setIsLoading(false);
      return;
    }


    try {
      let attachmentUrl = null
      let attachmentName = null

      // Upload file if present
      if (formData.file) {
        const uploadResult = await uploadAttachment(formData.file, user.id)
        attachmentUrl = uploadResult.url
        attachmentName = uploadResult.name
      }

      // Create CPD log
      await createCPDLog({
        user_id: user.id,
        date: formData.date,
        description: formData.description,
        hours: Number.parseFloat(formData.hours),
        category: formData.category as "Priority" | "Supplementary",
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
      })

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to save CPD log")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file }))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Add New CPD Log</CardTitle>
              <CardDescription>Record your continuing professional development activity</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Advanced Structural Analysis Workshop, Project Management Course..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>

                {/* Hours */}
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    placeholder="e.g., 6"
                    value={formData.hours}
                    onChange={(e) => setFormData((prev) => ({ ...prev, hours: e.target.value }))}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="category">Category</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowCategoryModal(true)}>
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Priority">Priority</SelectItem>
                      <SelectItem value="Supplementary">Supplementary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file">Attachment (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm text-gray-600 mb-2">Upload certificate, receipt, or other proof</div>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById("file")?.click()}>
                      Choose File
                    </Button>
                    {formData.file && <div className="mt-2 text-sm text-gray-600">Selected: {formData.file.name}</div>}
                  </div>
                  <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (max 10MB)</p>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Log"
                    )}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <CategoryModal open={showCategoryModal} onOpenChange={setShowCategoryModal} />
    </div>
  )
}
