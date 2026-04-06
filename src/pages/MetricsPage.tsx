import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'
import { IconPlus, IconRuler, IconTrendingUp, IconClipboard, IconTrash, IconSave, IconLoader, IconHeart } from '../components/Icons'
import MeasurementGuide from '../components/MeasurementGuide'
import HealthAlerts from '../components/HealthAlerts'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface Metric {
  id:string; date:string; weight_kg:number|null; body_fat_pct:number|null; chest_cm:number|null; waist_cm:number|null; hip_cm:number|null; bicep_left_cm:number|null; bicep_right_cm:number|null; thigh_left_cm:number|null; thigh_right_cm:number|null; calf_left_cm:number|null; calf_right_cm:number|null; notes:string|null
}

const emptyForm = { date: new Date().toISOString().split('T')[0], weight_kg:'', body_fat_pct:'', chest_cm:'', waist_cm:'', hip_cm:'', bicep_left_cm:'', bicep_right_cm:'', thigh_left_cm:'', thigh_right_cm:'', calf_left_cm:'', calf_right_cm:'', notes:'' }

const chartColors: Record<string,string> = { weight_kg:'#10b981', body_fat_pct:'#f59e0b', chest_cm:'#3b82f6', waist_cm:'#ef4444', hip_cm:'#8b5cf6', bicep_left_cm:'#06b6d4', thigh_left_cm:'#ec4899' }
const metricLabels: Record<string,string> = { weight_kg:'Peso (kg)', body_fat_pct:'Gordura (%)', chest_cm:'Peito (cm)', waist_cm:'Cintura (cm)', hip_cm:'Quadril (cm)', bicep_left_cm:'Bíceps E (cm)', bicep_right_cm:'Bíceps D (cm)', thigh_left_cm:'Coxa E (cm)', thigh_right_cm:'Coxa D (cm)', calf_left_cm:'Panturrilha E (cm)', calf_right_cm:'Panturrilha D (cm)' }

export default function MetricsPage() {
  const { user, profile } = useAuth()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [chartMetric, setChartMetric] = useState('weight_kg')
  const [tab, setTab] = useState<'historico'|'graficos'|'guia'>('historico')

  useEffect(() => { if (user) loadMetrics() }, [user])

  const loadMetrics = async () => {
    if (!user) return
    const { data } = await supabase.from('body_metrics').select('*').eq('user_id', user.id).order('date', { ascending: true })
    setMetrics(data || [])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!user) return; setSaving(true)
    const payload: Record<string,unknown> = { user_id: user.id, date: form.date, notes: form.notes || null }
    Object.entries(form).forEach(([key, val]) => { if (key !== 'date' && key !== 'notes' && val !== '') payload[key] = parseFloat(val as string) })
    await supabase.from('body_metrics').insert(payload)
    setForm(emptyForm); setShowForm(false); setSaving(false); loadMetrics()
  }

  const deleteMetric = async (id: string) => { if (!confirm('Excluir este registro?')) return; await supabase.from('body_metrics').delete().eq('id', id).eq('user_id', user!.id); loadMetrics() }

  const chartData = {
    labels: metrics.map(m => new Date(m.date+'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'short'})),
    datasets: [{ label: metricLabels[chartMetric], data: metrics.map(m => (m as unknown as Record<string,number|null>)[chartMetric]), borderColor: chartColors[chartMetric]||'#10b981', backgroundColor: (chartColors[chartMetric]||'#10b981')+'15', fill:true, tension:0.4, pointRadius:4, pointHoverRadius:7, borderWidth:2 }],
  }
  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins: { legend:{display:false}, tooltip:{ backgroundColor:'rgba(15,23,42,0.9)', titleColor:'#f1f5f9', bodyColor:'#94a3b8', padding:12, cornerRadius:8 } },
    scales: { x:{ ticks:{color:'#64748b'}, grid:{color:'rgba(148,163,184,0.06)'} }, y:{ ticks:{color:'#64748b'}, grid:{color:'rgba(148,163,184,0.06)'} } },
  }

  return (
    <div className="animate-slide-up">
      <div className="page-header" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div><h1>Medidas Corporais</h1><p>Registre e acompanhe suas medidas</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><IconPlus size={16} /> Nova Medida</button>
      </div>

      <HealthAlerts
        latestMetrics={metrics.length > 0 ? metrics[metrics.length - 1] : null}
        previousMetrics={metrics.length > 1 ? metrics[metrics.length - 2] : null}
        profile={profile}
      />

      <div className="tabs">
        <button className={`tab ${tab==='historico'?'active':''}`} onClick={() => setTab('historico')}><IconClipboard size={14} /> Histórico</button>
        <button className={`tab ${tab==='graficos'?'active':''}`} onClick={() => setTab('graficos')}><IconTrendingUp size={14} /> Gráficos</button>
        <button className={`tab ${tab==='guia'?'active':''}`} onClick={() => setTab('guia')}><IconHeart size={14} /> Como Medir</button>
      </div>

      {tab==='graficos' && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-header">
            <h3 className="card-title">Evolução</h3>
            <select className="form-select" style={{ width:'auto', padding:'8px 36px 8px 12px' }} value={chartMetric} onChange={e => setChartMetric(e.target.value)}>
              {Object.entries(metricLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          {metrics.length > 1 ? <div className="chart-container"><Line data={chartData} options={chartOpts} /></div> : (
            <div className="empty-state"><div className="empty-state-icon"><IconTrendingUp size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Registre pelo menos 2 medidas para ver o gráfico</div></div>
          )}
        </div>
      )}

      {tab==='historico' && (
        metrics.length > 0 ? (
          <div className="table-wrapper"><table className="table"><thead><tr><th>Data</th><th>Peso</th><th>Gordura</th><th>Peito</th><th>Cintura</th><th>Quadril</th><th>Bíceps</th><th>Coxa</th><th></th></tr></thead><tbody>
            {[...metrics].reverse().map(m => (
              <tr key={m.id}>
                <td style={{fontWeight:600, color:'var(--text-primary)'}}>{new Date(m.date+'T12:00:00').toLocaleDateString('pt-BR')}</td>
                <td>{m.weight_kg ? `${m.weight_kg} kg` : '—'}</td><td>{m.body_fat_pct ? `${m.body_fat_pct}%` : '—'}</td>
                <td>{m.chest_cm||'—'}</td><td>{m.waist_cm||'—'}</td><td>{m.hip_cm||'—'}</td>
                <td>{m.bicep_left_cm||m.bicep_right_cm ? `${m.bicep_left_cm||'—'} / ${m.bicep_right_cm||'—'}` : '—'}</td>
                <td>{m.thigh_left_cm||m.thigh_right_cm ? `${m.thigh_left_cm||'—'} / ${m.thigh_right_cm||'—'}` : '—'}</td>
                <td><button className="btn-icon" onClick={() => deleteMetric(m.id)} title="Excluir"><IconTrash size={15} /></button></td>
              </tr>
            ))}
          </tbody></table></div>
        ) : (
          <div className="empty-state card"><div className="empty-state-icon"><IconRuler size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Nenhuma medida registrada</div><div className="empty-state-sub">Clique em "Nova Medida" para começar</div></div>
        )
      )}

      {tab==='guia' && <MeasurementGuide />}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="modal-title">Nova Medida</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Data</label><input type="date" className="form-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Peso (kg)</label><input type="number" step="0.1" min="0.1" max="499" className="form-input" placeholder="80.0" value={form.weight_kg} onChange={e => setForm({...form, weight_kg: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Gordura (%)</label><input type="number" step="0.1" min="0" max="100" className="form-input" placeholder="15.0" value={form.body_fat_pct} onChange={e => setForm({...form, body_fat_pct: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Peito (cm)</label><input type="number" step="0.1" min="0.1" max="299" className="form-input" value={form.chest_cm} onChange={e => setForm({...form, chest_cm: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Cintura (cm)</label><input type="number" step="0.1" min="0.1" max="299" className="form-input" value={form.waist_cm} onChange={e => setForm({...form, waist_cm: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Quadril (cm)</label><input type="number" step="0.1" min="0.1" max="299" className="form-input" value={form.hip_cm} onChange={e => setForm({...form, hip_cm: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Bíceps E (cm)</label><input type="number" step="0.1" min="0.1" max="99" className="form-input" value={form.bicep_left_cm} onChange={e => setForm({...form, bicep_left_cm: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Bíceps D (cm)</label><input type="number" step="0.1" min="0.1" max="99" className="form-input" value={form.bicep_right_cm} onChange={e => setForm({...form, bicep_right_cm: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Coxa E (cm)</label><input type="number" step="0.1" min="0.1" max="149" className="form-input" value={form.thigh_left_cm} onChange={e => setForm({...form, thigh_left_cm: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Coxa D (cm)</label><input type="number" step="0.1" min="0.1" max="149" className="form-input" value={form.thigh_right_cm} onChange={e => setForm({...form, thigh_right_cm: e.target.value})} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Panturrilha E (cm)</label><input type="number" step="0.1" min="0.1" max="99" className="form-input" value={form.calf_left_cm} onChange={e => setForm({...form, calf_left_cm: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Panturrilha D (cm)</label><input type="number" step="0.1" min="0.1" max="99" className="form-input" value={form.calf_right_cm} onChange={e => setForm({...form, calf_right_cm: e.target.value})} /></div>
            </div>
            <div className="form-group"><label className="form-label">Notas</label><textarea className="form-textarea" placeholder="Observações..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            <div style={{ display:'flex', gap:12 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><IconLoader size={15} className="icon-spin" /> Salvando...</> : <><IconSave size={15} /> Salvar</>}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div></div>
      )}
    </div>
  )
}
