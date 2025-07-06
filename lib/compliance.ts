import { supabase } from "./supabase"

export interface ComplianceData {
  year: number
  goal: number
  priorityHours: number
  supplementaryHours: number
  supplementaryCountedHours: number
  totalCountedHours: number
  progressPercentage: number
  isCompliant: boolean
  supplementaryLimit: number
}

export interface YearlyGoal {
  id?: string
  user_id: string
  year: number
  goal: number
  created_at?: string
  updated_at?: string
}

export const calculateCompliance = (
  priorityHours: number,
  supplementaryHours: number,
  goal: number,
): {
  supplementaryCountedHours: number
  totalCountedHours: number
  progressPercentage: number
  isCompliant: boolean
  supplementaryLimit: number
} => {
  const supplementaryLimit = Math.floor(goal * 0.2)
  const supplementaryCountedHours = Math.min(supplementaryHours, supplementaryLimit)
  const totalCountedHours = priorityHours + supplementaryCountedHours
  const progressPercentage = (totalCountedHours / goal) * 100
  const isCompliant = totalCountedHours >= goal

  return {
    supplementaryCountedHours,
    totalCountedHours,
    progressPercentage,
    isCompliant,
    supplementaryLimit,
  }
}

export const getYearlyCompliance = async (
  userId: string,
  year: number
): Promise<ComplianceData> => {
  const { data: goalData, error: goalError } = await supabase
    .from("yearly_goals")
    .select("goal")
    .eq("user_id", userId)
    .eq("year", year)
    .single()

  if (goalError && goalError.code !== "PGRST116") throw goalError
  const goal = (goalData?.goal as number) || 30

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  type CPDLog = { hours: number; category: string }

  const { data, error } = await supabase
    .from("cpd_logs")
    .select("hours, category")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) throw error

  const logs = data as CPDLog[]

  const priorityHours = logs?.filter(log => log.category === "Priority")
    .reduce((sum, log) => sum + log.hours, 0) || 0

  const supplementaryHours = logs?.filter(log => log.category === "Supplementary")
    .reduce((sum, log) => sum + log.hours, 0) || 0

  const compliance = calculateCompliance(priorityHours, supplementaryHours, goal)

  return {
    year,
    goal,
    priorityHours,
    supplementaryHours,
    ...compliance,
  }
}

export const getAvailableYears = async (userId: string): Promise<number[]> => {
  const { data, error } = await supabase
    .from("cpd_logs")
    .select("date")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  if (error) throw error

  const logs = data as { date: string }[]

  if (!logs || logs.length === 0) {
    return [new Date().getFullYear()]
  }

  const years = [...new Set(logs.map((log) => new Date(log.date).getFullYear()))]

  const currentYear = new Date().getFullYear()
  if (!years.includes(currentYear)) {
    years.push(currentYear)
  }

  return years.sort((a, b) => b - a)
}

export const setYearlyGoal = async (
  userId: string,
  year: number,
  goal: number
): Promise<void> => {
  const { error } = await supabase
    .from("yearly_goals")
    .upsert(
      {
        user_id: userId,
        year,
        goal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,year" }
    )

  if (error) throw error
}

export const getYearlyGoal = async (
  userId: string,
  year: number
): Promise<number> => {
  const { data, error } = await supabase
    .from("yearly_goals")
    .select("goal")
    .eq("user_id", userId)
    .eq("year", year)
    .single()

  if (error && error.code !== "PGRST116") throw error

  return (data?.goal as number) || 30
}
