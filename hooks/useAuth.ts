"use client"

import { useEffect, useState } from "react"
import { useSession } from "@supabase/auth-helpers-react"
import { getProfile, createProfile } from "@/lib/auth"
import type { Database } from "@/lib/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function useAuth() {
  const session = useSession()
  const user = session?.user ?? null

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Prevent loading state from flipping too early if session is undefined (hydration)
    if (typeof session === "undefined") {
      setLoading(true)
      return
    }

    const fetchProfile = async () => {
      if (user) {
        try {
          let profileData = await getProfile(user.id)

          // Create one if it doesn't exist
          if (!profileData) {
            profileData = await createProfile({
              id: user.id,
              email: user.email ?? "",
            })
          }

          setProfile(profileData)
        } catch (err) {
          console.error("Failed to load or create profile:", err)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    fetchProfile()
    // Only re-run when user or session changes
  }, [user, session])

  const refreshProfile = async () => {
    if (user) {
      try {
        const profileData = await getProfile(user.id)
        setProfile(profileData)
      } catch (err) {
        console.error("Error refreshing profile:", err)
      }
    }
  }

  return {
    user,
    profile,
    loading, // <-- FIXED: Only uses the real loading state now!
    refreshProfile,
    isAuthenticated: !!user,
  }
}
