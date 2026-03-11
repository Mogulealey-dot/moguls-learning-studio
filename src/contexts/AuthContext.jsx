import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  // undefined = still loading, null = signed out, object = signed in
  const [currentUser, setCurrentUser] = useState(undefined)

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => setCurrentUser(user ?? null))
  }, [])

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ currentUser, logout, loading: currentUser === undefined }}>
      {children}
    </AuthContext.Provider>
  )
}
