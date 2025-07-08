"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { Mail, Bell, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { updateProfile } from "@/lib/auth"

export default function SettingsPage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailNotifications: true,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
      return
    }

    if (profile) {
      setFormData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        emailNotifications: profile.email_notifications,
      })
    }
  }, [user, profile, authLoading, router])

  const handleSaveSettings = async () => {
    if (!user || !profile) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await updateProfile(user.id, {
        first_name: formData.firstName || null,
        last_name: formData.lastName || null,
        email_notifications: formData.emailNotifications,
      })

      await refreshProfile()
      setSuccess("Settings saved successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestEmail = async () => {
    setSuccess("Test email functionality would be implemented here!")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and notifications</p>
          </div>

          {success && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <CardTitle>Email Notifications (Coming soon)</CardTitle>
                </div>
                <CardDescription>Configure your email reminder preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">
                      Enable email reminders for CPD tracking
                    </Label>
                    <div className="text-sm text-gray-600">Get monthly reminders to log your CPD activities</div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                {formData.emailNotifications && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <Input id="email" type="email" value={profile.email} disabled className="flex-1" />
                      </div>
                      <p className="text-xs text-gray-500">Contact support to change your email address</p>
                    </div>

                    <Button variant="outline" onClick={handleTestEmail}>
                      Send Test Email
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Export */}
            <Card>
              <CardHeader>
                <CardTitle>Data Export (Coming soon)</CardTitle>
                <CardDescription>Export your CPD data for records or audits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Download a comprehensive report of all your CPD activities, suitable for PEO audits.
                  </p>
                  <Button variant="outline">Export CPD Report (PDF)</Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isLoading} className="px-8">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
