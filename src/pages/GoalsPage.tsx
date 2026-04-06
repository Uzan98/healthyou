import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { IconPlus, IconTarget, IconCheck, IconEdit, IconTrash, IconSave, IconLoader, IconX } from '../components/Icons'

interface Goal { id:string; title:string; metric_type:string; target_value:number; current_value:number; unit:string; status:string; created_at:string }

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', metric_type:'peso', target_value:'', unit:'kg' })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    if (!user) return
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setGoals(data || [])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!user) return; setSaving(true)
    await supabase.from('goals').insert({ user_id: user.id, title: form.title, metric_type: form.metric_type, target_value: parseFloat(form.target_value), unit: form.unit, current_value: 0 })
    setForm({ title:'', metric_type:'peso', target_value:'', unit:'kg' })
    setShowForm(false); setSaving(false); load()
  }

  const updateValue = async (id: string) => {
    await supabase.from('goals').update({ current_value: parseFloat(editValue) }).eq('id', id)
    setEditId(null); setEditValue(''); load()
  }

  const completeGoal = async (id: string) => { await supabase.from('goals').update({ status: 'concluida' }).eq('id', id); load() }
  const deleteGoal = async (id: string) => { if (!confirm('Excluir meta?')) return; await supabase.from('goals').delete().eq('id', id); load() }

  const active = goals.filter(g => g.status === 'ativa')
  const completed = goals.filter(g => g.status === 'concluida')

  return (
    <div className="animate-slide-up">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div><h1>Metas</h1><p>Defina e acompanhe seus objetivos</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><IconPlus size={16} /> Nova Meta</button>
      </div>

      <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16, color:'var(--accent-primary)', display:'flex', alignItems:'center', gap:8 }}><IconTarget size={18} /> Metas Ativas ({active.length})</h3>
      {active.length > 0 ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:16, marginBottom:32 }}>
          {active.map(g => {
            const pct = g.target_value ? Math.min(100, Math.max(0, (g.current_value / g.target_value)*100)) : 0
            return (
              <div key={g.id} className="goal-card">
                <div className="goal-card-header"><span className="goal-card-title">{g.title}</span><span className="goal-card-status ativa">Ativa</span></div>
                <div className="goal-progress-bar"><div className={`goal-progress-fill ${pct>=100?'complete':''}`} style={{width:`${pct}%`}}/></div>
                <div className="goal-progress-values"><span>{g.current_value} {g.unit}</span><span>{g.target_value} {g.unit}</span></div>
                <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                  {editId === g.id ? (<>
                    <input type="number" step="0.1" className="form-input" style={{width:100, padding:'6px 10px'}} value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="Valor" />
                    <button className="btn btn-primary btn-sm" onClick={() => updateValue(g.id)}><IconSave size={13} /> Salvar</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}><IconX size={13} /></button>
                  </>) : (<>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditId(g.id); setEditValue(String(g.current_value)) }}><IconEdit size={13} /> Atualizar</button>
                    {pct >= 100 && <button className="btn btn-primary btn-sm" onClick={() => completeGoal(g.id)}><IconCheck size={13} /> Concluir</button>}
                    <button className="btn btn-danger btn-sm" onClick={() => deleteGoal(g.id)}><IconTrash size={13} /></button>
                  </>)}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state card" style={{ marginBottom:32 }}><div className="empty-state-icon"><IconTarget size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Nenhuma meta ativa</div><div className="empty-state-sub">Crie metas para acompanhar seu progresso</div></div>
      )}

      {completed.length > 0 && (<>
        <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:16, color:'var(--accent-secondary)', display:'flex', alignItems:'center', gap:8 }}><IconCheck size={18} /> Concluídas ({completed.length})</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:16 }}>
          {completed.map(g => (
            <div key={g.id} className="goal-card" style={{ opacity:0.7 }}>
              <div className="goal-card-header"><span className="goal-card-title">{g.title}</span><span className="goal-card-status concluida">Concluída</span></div>
              <div className="goal-progress-bar"><div className="goal-progress-fill complete" style={{width:'100%'}}/></div>
              <div className="goal-progress-values"><span>{g.current_value} {g.unit}</span><span>{g.target_value} {g.unit}</span></div>
            </div>
          ))}
        </div>
      </>)}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="modal-title">Nova Meta</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Título</label><input className="form-input" placeholder="Ex: Chegar a 80kg" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Valor Alvo</label><input type="number" step="0.1" className="form-input" placeholder="80" value={form.target_value} onChange={e => setForm({...form, target_value: e.target.value})} required /></div>
              <div className="form-group"><label className="form-label">Unidade</label><select className="form-select" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}><option value="kg">kg</option><option value="cm">cm</option><option value="%">%</option><option value="min">min</option></select></div>
            </div>
            <div style={{display:'flex', gap:12}}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><IconLoader size={15} className="icon-spin" /> Criando...</> : <><IconSave size={15} /> Criar Meta</>}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div></div>
      )}
    </div>
  )
}
