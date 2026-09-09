import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getToken, clearToken } from '../lib/auth'

export default function Nav(){
  const [authed, setAuthed] = useState(false)
  useEffect(()=>{
    setAuthed(!!getToken())
  },[])
  function logout(){
    clearToken()
    setAuthed(false)
    window.location.href = '/'
  }
  return (
    <div style={{background:'#2d3748',color:'#fff',padding:'10px 20px'}}>
      <div className="container header">
        <div>
          <Link href="/" style={{color:'#fff',textDecoration:'none'}}><strong>TaskManager</strong></Link>
        </div>
        <div>
          {authed ? (
            <>
              <Link href="/tasks"><a style={{color:'#fff',marginRight:12}}>Tasks</a></Link>
              <button onClick={logout} className="button secondary" style={{padding:'6px 10px'}}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login"><a style={{color:'#fff',marginRight:12}}>Login</a></Link>
              <Link href="/auth/register"><a style={{color:'#fff'}}>Register</a></Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
