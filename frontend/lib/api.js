import { getToken } from './auth'

export async function apiFetch(path, opts = {}){
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const headers = opts.headers || {}
  const token = getToken()
  if (token) headers['Authorization'] = 'Bearer ' + token
  if (!headers['Content-Type'] && opts.body) headers['Content-Type'] = 'application/json'
  const res = await fetch(base + path, { ...opts, headers })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch (e) { data = text }
  if (!res.ok) throw data
  return data
}
