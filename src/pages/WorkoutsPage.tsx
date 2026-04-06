import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { IconPlus, IconCalendar, IconClock, IconDumbbell, IconTrash, IconSave, IconLoader } from '../components/Icons'

interface Workout { id:string; date:string; type:string; duration_min:number|null; notes:string|null }

const typeLabels: Record<string,string> = { musculacao:'Musculação', cardio:'Cardio', hiit:'HIIT', funcional:'Funcional', esporte:'Esporte', outro:'Outro' }
const typeColors: Record<string,string> = { musculacao:'badge-green', cardio:'badge-blue', hiit:'badge-yellow', funcional:'badge-purple', esporte:'badge-green', outro:'badge-blue' }

export default function WorkoutsPage() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], type:'musculacao', duration_min:'', notes:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    if (!user) return
    const { data } = await supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setWorkouts(data||[])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!user) return; setSaving(true)
    await supabase.from('workouts').insert({ user_id: user.id, date: form.date, type: form.type, duration_min: form.duration_min ? parseInt(form.duration_min) : null, notes: form.notes || null })
    setForm({ date: new Date().toISOString().split('T')[0], type:'musculacao', duration_min:'', notes:'' })
    setShowForm(false); setSaving(false); load()
  }

  const del = async (id: string) => { if (!confirm('Excluir?')) return; await supabase.from('workouts').delete().eq('id', id).eq('user_id', user!.id); load() }

  const now = new Date(); const ws = new Date(now); ws.setDate(now.getDate() - now.getDay())
  const thisWeek = workouts.filter(w => new Date(w.date) >= ws)
  const totalMin = thisWeek.reduce((a, w) => a + (w.duration_min || 0), 0)

  return (
    <div className="animate-slide-up">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div><h1>Treinos</h1><p>Registre seus treinos e acompanhe a frequência</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><IconPlus size={16} /> Novo Treino</button>
      </div>

      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card accent-green"><div className="stat-card-icon"><IconCalendar size={22} color="var(--accent-primary)" /></div><div className="stat-card-value">{thisWeek.length}</div><div className="stat-card-label">Treinos esta semana</div></div>
        <div className="stat-card accent-blue"><div className="stat-card-icon"><IconClock size={22} color="var(--accent-secondary)" /></div><div className="stat-card-value">{totalMin} min</div><div className="stat-card-label">Tempo esta semana</div></div>
        <div className="stat-card accent-purple"><div className="stat-card-icon"><IconDumbbell size={22} color="var(--accent-purple)" /></div><div className="stat-card-value">{workouts.length}</div><div className="stat-card-label">Total de treinos</div></div>
      </div>

      {workouts.length > 0 ? (
        <div className="table-wrapper"><table className="table"><thead><tr><th>Data</th><th>Tipo</th><th>Duração</th><th>Notas</th><th></th></tr></thead><tbody>
          {workouts.map(w => (<tr key={w.id}>
            <td style={{fontWeight:600, color:'var(--text-primary)'}}>{new Date(w.date+'T12:00:00').toLocaleDateString('pt-BR')}</td>
            <td><span className={`badge ${typeColors[w.type]||'badge-green'}`}>{typeLabels[w.type]||w.type}</span></td>
            <td>{w.duration_min ? `${w.duration_min} min` : '—'}</td>
            <td style={{maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{w.notes||'—'}</td>
            <td><button className="btn-icon" onClick={() => del(w.id)}><IconTrash size={15} /></button></td>
          </tr>))}
        </tbody></table></div>
      ) : (
        <div className="empty-state card"><div className="empty-state-icon"><IconDumbbell size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Nenhum treino registrado</div><div className="empty-state-sub">Clique em "Novo Treino" para começar</div></div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="modal-title">Novo Treino</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Data</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Tipo</label><select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>{Object.entries(typeLabels).map(([k,l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Duração (min)</label><input type="number" min="1" max="1440" className="form-input" placeholder="60" value={form.duration_min} onChange={e => setForm({...form, duration_min: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Notas</label><textarea className="form-textarea" placeholder="Ex: treino de peito..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div style={{display:'flex', gap:12}}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><IconLoader size={15} className="icon-spin" /> Salvando...</> : <><IconSave size={15} /> Salvar</>}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div></div>
      )}
    </div>
  )
}
