import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { apiFetch } from '../../lib/api'
import { getToken } from '../../lib/auth'

export default function Tasks(){
  const router = useRouter()
  const [tasks,setTasks] = useState([])
  const [loading,setLoading] = useState(true)
  const [title,setTitle] = useState('')
  const [desc,setDesc] = useState('')
  const [err,setErr] = useState('')

  useEffect(()=>{
    if (!getToken()) { router.push('/auth/login'); return }
    load()
  },[])

  async function load(){
    setLoading(true)
    try{
      const data = await apiFetch('/api/tasks')
      setTasks(data)
    }catch(e){ setErr(e.error || JSON.stringify(e)) }
    setLoading(false)
  }

  async function create(e){
    e.preventDefault(); setErr('')
    try{
      await apiFetch('/api/tasks', { method:'POST', body: JSON.stringify({ title, description: desc }) })
      setTitle(''); setDesc('')
      await load()
    }catch(e){ setErr(e.error || JSON.stringify(e)) }
  }

  async function toggleCompleted(t){
    try{
      await apiFetch('/api/tasks/' + t.id, { method:'PUT', body: JSON.stringify({ completed: !t.completed }) })
      await load()
    }catch(e){ setErr(e.error || JSON.stringify(e)) }
  }

  async function remove(t){
    if(!confirm('Delete task?')) return
    try{
      await apiFetch('/api/tasks/' + t.id, { method:'DELETE' })
      await load()
    }catch(e){ setErr(e.error || JSON.stringify(e)) }
  }

  return (
    <div className="container">
      <h2>My Tasks</h2>
      <form onSubmit={create} className="form" style={{marginBottom:16}}>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" />
        <input className="input" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" />
        <div style={{display:'flex',gap:8}}>
          <button className="button" type="submit">Create</button>
        </div>
      </form>

      {err && <div style={{color:'red'}}>{err}</div>}

      {loading ? <div className="small">Loading...</div> : (
        tasks.length===0 ? <div className="small">No tasks yet.</div> : (
          tasks.map(t => (
            <div key={t.id} className="task">
              <div className="left">
                <input type="checkbox" checked={t.completed} onChange={()=>toggleCompleted(t)} />
                <div>
                  <div><strong>{t.title}</strong></div>
                  <div className="small">{t.description}</div>
                </div>
              </div>
              <div>
                <button className="button secondary" onClick={()=>remove(t)}>Delete</button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  )
}
