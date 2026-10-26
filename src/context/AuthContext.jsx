import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { loginOrRegister as loginOrRegisterRequest } from '../services/passwordlessAuth'
const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*, roles(name)')
      .eq('id', userId)
      .single()

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load profile:', error.message)
      setProfile(null)
      return
    }
    setProfile(data)
  }, [])

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return
      setSession(data.session)
      if (data.session?.user?.id) {
        await fetchProfile(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession?.user?.id) {
        await fetchProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [fetchProfile])

  const refreshProfile = useCallback(() => {
    if (session?.user?.id) return fetchProfile(session.user.id)
    return Promise.resolve()
  }, [session, fetchProfile])



 const loginOrRegister = useCallback(async ({ fullName, email }) => {
  const { data, error } = await loginOrRegisterRequest({ fullName, email })
  return { data, error }
}, [])
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.roles?.name ?? null,
    loading,
    signOut,
    refreshProfile,
    loginOrRegister,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}