"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Target, AlertCircle, CheckCircle } from "lucide-react"
import { setYearlyGoal } from "@/lib/compliance"

interface YearGoalManagerProps {
  userId: string
  year: number
  currentGoal: number
  onGoalUpdated: () => void
}

export function YearGoalManager({ userId, year, currentGoal, onGoalUpdated }: YearGoalManagerProps) {
  const [newGoal, setNewGoal] = useState(currentGoal)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpdateGoal = async () => {
    if (newGoal < 1 || newGoal > 200) {
      setError("Goal must be between 1 and 200 hours")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await setYearlyGoal(userId, year, newGoal)
      setSuccess(true)
      onGoalUpdated()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update goal")
    } finally {
      setIsLoading(false)
    }
  }

  const isChanged = newGoal !== currentGoal

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <CardTitle>{year} Compliance Goal</CardTitle>
        </div>
        <CardDescription>
          Your CPD hours target is determined by PEO through a yearly self-assessment quiz. Enter the goal provided to you below for the year {year}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Goal updated successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="goal">Annual CPD Hours Goal</Label>
          <Input
            id="goal"
            type="number"
            min="1"
            max="200"
            value={newGoal}
            onChange={(e) => {
              setNewGoal(Number(e.target.value))
              setError(null)
            }}
          />
          <p className="text-xs text-gray-500">
            Supplementary hours will count up to {Math.floor(newGoal * 0.2)} hours (20% of goal)
          </p>
        </div>

        <Button onClick={handleUpdateGoal} disabled={isLoading || !isChanged} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            `Update ${year} Goal`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
