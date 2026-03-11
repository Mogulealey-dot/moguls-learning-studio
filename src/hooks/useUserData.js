import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Cloud-synced state hook — replaces LS.get/set for persistent user data.
 * Data is stored at: users/{uid}/data/{key}
 *
 * Usage:  const [tasks, setTasks] = useUserData('mls_tasks', [])
 * setTasks(updated)  ← updates local state AND Firestore simultaneously
 */
export function useUserData(key, defaultValue) {
  const { currentUser } = useAuth()
  const [data, setDataState] = useState(defaultValue)
  const [loading, setLoading] = useState(true)

  // Fetch from Firestore when user or key changes
  useEffect(() => {
    if (!currentUser) {
      setDataState(defaultValue)
      setLoading(false)
      return
    }
    setLoading(true)
    const ref = doc(db, 'users', currentUser.uid, 'data', key)
    getDoc(ref)
      .then((snap) => {
        if (snap.exists()) setDataState(snap.data().v ?? defaultValue)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid, key])

  const setData = useCallback((valueOrUpdater) => {
    if (typeof valueOrUpdater === 'function') {
      setDataState((prev) => {
        const next = valueOrUpdater(prev)
        if (currentUser) {
          setDoc(doc(db, 'users', currentUser.uid, 'data', key), { v: next }).catch(console.error)
        }
        return next
      })
    } else {
      setDataState(valueOrUpdater)
      if (currentUser) {
        setDoc(doc(db, 'users', currentUser.uid, 'data', key), { v: valueOrUpdater }).catch(console.error)
      }
    }
  }, [currentUser?.uid, key]) // eslint-disable-line react-hooks/exhaustive-deps

  return [data, setData, loading]
}
