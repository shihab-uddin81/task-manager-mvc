import { useState } from 'react'
import { useRouter } from 'next/router'
import { register } from '../../lib/auth'

export default function Register(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [err,setErr]=useState('')
  const router = useRouter()
  async function submit(e){
    e.preventDefault(); setErr('')
    try{
      await register(username,password)
      router.push('/tasks')
    }catch(err){ setErr(err.message || JSON.stringify(err)) }
  }
  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={submit} className="form">
        <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
        <input className="input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
        <div style={{display:'flex',gap:8}}>
          <button className="button" type="submit">Register</button>
        </div>
        {err && <div style={{color:'red'}}>{err}</div>}
      </form>
    </div>
  )
}
