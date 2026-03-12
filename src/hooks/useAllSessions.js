import { useUserData } from './useUserData'

// All known pomodoro session keys across every studio
const KEYS = [
  'mls_pomodoro_sessions',
  'mls_math_pomodoro',
  'mls_cs_pomodoro',
  'mls_phil_pomodoro',
  'mls_sci_pomodoro',
  'mls_lit_pomodoro',
  'mls_hist_pomodoro',
  'mls_arts_pomodoro',
  'mls_acct_pomodoro',
  'mls_econ_pomodoro',
  'mls_calc_pomodoro',
  'mls_acctf_pomodoro',
]

export function useAllSessions() {
  // Rules of Hooks: fixed number of calls, same order every render
  const [s0]  = useUserData(KEYS[0],  [])
  const [s1]  = useUserData(KEYS[1],  [])
  const [s2]  = useUserData(KEYS[2],  [])
  const [s3]  = useUserData(KEYS[3],  [])
  const [s4]  = useUserData(KEYS[4],  [])
  const [s5]  = useUserData(KEYS[5],  [])
  const [s6]  = useUserData(KEYS[6],  [])
  const [s7]  = useUserData(KEYS[7],  [])
  const [s8]  = useUserData(KEYS[8],  [])
  const [s9]  = useUserData(KEYS[9],  [])
  const [s10] = useUserData(KEYS[10], [])
  const [s11] = useUserData(KEYS[11], [])
  return [...s0, ...s1, ...s2, ...s3, ...s4, ...s5, ...s6, ...s7, ...s8, ...s9, ...s10, ...s11]
}
