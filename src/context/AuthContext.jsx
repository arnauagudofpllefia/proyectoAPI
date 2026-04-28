/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  getProfile,
  login as apiLogin,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
} from '../services/api'

const STORAGE_KEY = 'vinacoteca-auth'
const emptyAuth = { token: '', user: null }

const AuthContext = createContext(null)

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return emptyAuth
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : emptyAuth
  } catch {
    return emptyAuth
  }
}

function persistAuth(auth) {
  if (typeof window === 'undefined') {
    return
  }

  if (!auth.token) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function AuthProvider({ children }) {
  const initialAuth = readStoredAuth()
  const [auth, setAuth] = useState(initialAuth)
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(Boolean(initialAuth.token))

  useEffect(() => {
    persistAuth(auth)
  }, [auth])

  useEffect(() => {
    let isMounted = true

    if (!auth.token) {
      setBootstrapping(false)
      return () => {
        isMounted = false
      }
    }

    getProfile(auth.token)
      .then((user) => {
        if (isMounted) {
          setAuth((current) => ({ ...current, user }))
        }
      })
      .catch(() => {
        if (isMounted) {
          setAuth(emptyAuth)
        }
      })
      .finally(() => {
        if (isMounted) {
          setBootstrapping(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [auth.token])

  const login = useCallback(async (credentials) => {
    setLoading(true)

    try {
      const result = await apiLogin(credentials)
      setAuth(result)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)

    try {
      return await apiRegister(payload)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setAuth(emptyAuth)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!auth.token) {
      return null
    }

    const user = await getProfile(auth.token)
    setAuth((current) => ({ ...current, user }))
    return user
  }, [auth.token])

  const saveProfile = useCallback(
    async (profile) => {
      if (!auth.token) {
        throw new Error('No hay sesión iniciada.')
      }

      setLoading(true)

      try {
        const user = await apiUpdateProfile(auth.token, profile)
        setAuth((current) => ({ ...current, user }))
        return user
      } finally {
        setLoading(false)
      }
    },
    [auth.token],
  )

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      loading,
      bootstrapping,
      isAuthenticated: Boolean(auth.token),
      login,
      register,
      logout,
      refreshProfile,
      saveProfile,
      hasRole: (...roles) => roles.length === 0 || roles.includes(auth.user?.role),
    }),
    [auth.token, auth.user, loading, bootstrapping, login, register, logout, refreshProfile, saveProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }

  return context
}
