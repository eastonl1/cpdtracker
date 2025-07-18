import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export const signUp = async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
        ? "https://cpd-tracker.ca/auth/verify"
        : "http://localhost:3000/auth/verify",


    },
  })

  if (error) throw error

  // Create profile after successful signup
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email!,
      first_name: firstName || null,
      last_name: lastName || null,
      cpd_goal: 30,
      email_notifications: true,
    })

    if (profileError) throw profileError
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>()

  if (error) throw error
  return data
}

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ✅ Reusable createProfile function
export const createProfile = async (user: { id: string; email: string | undefined }) => {
  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    first_name: null,
    last_name: null,
    cpd_goal: 30,
    email_notifications: true,
  })

  if (error) throw error

  return getProfile(user.id)
}
