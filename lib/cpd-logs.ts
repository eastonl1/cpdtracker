import { supabase } from "./supabase"
import type { Database } from "./supabase"

type CPDLog = Database["public"]["Tables"]["cpd_logs"]["Row"]
type CPDLogInsert = Database["public"]["Tables"]["cpd_logs"]["Insert"]
type CPDLogUpdate = Database["public"]["Tables"]["cpd_logs"]["Update"]

export const getCPDLogs = async (userId: string, category?: "Priority" | "Supplementary") => {
  let query = supabase.from("cpd_logs").select("*").eq("user_id", userId).order("date", { ascending: false })

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) throw error
  return data as CPDLog[]
}

export const getCPDLog = async (id: string) => {
  const { data, error } = await supabase.from("cpd_logs").select("*").eq("id", id).single()

  if (error) throw error
  return data as CPDLog
}

export const createCPDLog = async (log: CPDLogInsert) => {
  const { data, error } = await supabase.from("cpd_logs").insert(log).select().single()

  if (error) throw error
  return data as CPDLog
}

export const updateCPDLog = async (id: string, updates: CPDLogUpdate) => {
  const { data, error } = await supabase
    .from("cpd_logs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as CPDLog
}

export const deleteCPDLog = async (id: string) => {
  const { error } = await supabase.from("cpd_logs").delete().eq("id", id)

  if (error) throw error
}

export const uploadAttachment = async (file: File, userId: string) => {
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage.from("cpd-attachments").upload(fileName, file)

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from("cpd-attachments").getPublicUrl(fileName)

  return {
    url: publicUrl,
    name: file.name,
  }
}

export const getCPDStats = async (userId: string) => {
  type MinimalLog = { hours: number; category: "Priority" | "Supplementary" }

  const { data, error } = await supabase
    .from("cpd_logs")
    .select("hours, category")
    .eq("user_id", userId)

  if (error) throw error

  const logs = data as MinimalLog[]

  const totalHours = logs.reduce((sum, log) => sum + log.hours, 0)
  const priorityHours = logs.filter((log) => log.category === "Priority").reduce((sum, log) => sum + log.hours, 0)
  const supplementaryHours = logs.filter((log) => log.category === "Supplementary").reduce((sum, log) => sum + log.hours, 0)

  return {
    totalHours,
    priorityHours,
    supplementaryHours,
    totalLogs: logs.length,
  }
}
