import { useState } from 'react'
import { LS } from './utils'
import AuthScreen    from './components/AuthScreen'
import LandingPage   from './LandingPage'
import FinanceStudio from './App'
import GenericStudio from './studios/GenericStudio'
import STUDIO_CONFIGS from './studioConfigs'

export default function Root() {
  const [user,   setUser]   = useState(() => LS.get('mls_user', null))
  const [studio, setStudio] = useState(null)

  const login          = (u) => { LS.set('mls_user', u); setUser(u) }
  const logout         = ()  => { LS.set('mls_user', null); setUser(null); setStudio(null) }
  const enterStudio    = (id) => setStudio(id)
  const backToLanding  = ()  => setStudio(null)

  if (!user) return <AuthScreen onLogin={login} />

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
