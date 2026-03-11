import { useTheme } from '../hooks/useTheme'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      className={styles.btn}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
