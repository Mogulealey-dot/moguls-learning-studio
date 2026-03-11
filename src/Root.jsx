import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import AuthScreen    from './components/AuthScreen'
import LandingPage   from './LandingPage'
import FinanceStudio from './App'
import GenericStudio from './studios/GenericStudio'
import STUDIO_CONFIGS from './studioConfigs'

export default function Root() {
  const { currentUser, logout, loading } = useAuth()
  const [studio, setStudio] = useState(null)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mist)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.1em', fontSize: 13 }}>
        Loading…
      </div>
    )
  }

  if (!currentUser) return <AuthScreen />

  // Normalise Firebase user → app user shape { name, email }
  const user = { name: currentUser.displayName || currentUser.email, email: currentUser.email }

  const enterStudio   = (id) => setStudio(id)
  const backToLanding = ()   => setStudio(null)

  if (studio === 'finance') {
    return <FinanceStudio user={user} onLogout={logout} onBack={backToLanding} />
  }

  if (studio && STUDIO_CONFIGS[studio]) {
    return (
      <GenericStudio
        config={STUDIO_CONFIGS[studio]}
        user={user}
        onLogout={logout}
        onBack={backToLanding}
      />
    )
  }

  return <LandingPage user={user} onLogout={logout} onEnterStudio={enterStudio} />
}
