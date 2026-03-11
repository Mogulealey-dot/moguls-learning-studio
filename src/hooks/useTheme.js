import { useEffect } from 'react'
import { useUserData } from './useUserData'

export function useTheme() {
  const [theme, setThemeData] = useUserData('mls_theme', 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => setThemeData(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggleTheme }
}
