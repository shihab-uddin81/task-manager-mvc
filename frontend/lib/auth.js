// Simple auth token helpers
export function saveToken(token){
  if(typeof window !== 'undefined') localStorage.setItem('tm_token', token)
}
export function getToken(){
  if(typeof window === 'undefined') return null
  return localStorage.getItem('tm_token')
}
export function clearToken(){
  if(typeof window !== 'undefined') localStorage.removeItem('tm_token')
}

export async function login(username, password){
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  saveToken(data.token)
  return data
}

export async function register(username, password){
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/register', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Register failed')
  saveToken(data.token)
  return data
}
