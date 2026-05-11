const VALID_ID = 'fam4'
const VALID_PW = '6915'
const SESSION_KEY = 'auth'

export function login(id: string, pw: string): boolean {
  if (id === VALID_ID && pw === VALID_PW) {
    sessionStorage.setItem(SESSION_KEY, 'true')
    return true
  }
  return false
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}
