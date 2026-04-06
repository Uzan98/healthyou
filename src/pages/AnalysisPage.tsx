import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler, Legend } from 'chart.js'
import { IconScale, IconRuler, IconActivity, IconClock, IconTrendingUp, IconDumbbell, IconBarChart, IconClipboard } from '../components/Icons'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler, Legend)

interface Metric { id:string; date:string; weight_kg:number|null; body_fat_pct:number|null; waist_cm:number|null; chest_cm:number|null; hip_cm:number|null; bicep_left_cm:number|null; thigh_left_cm:number|null }
interface Workout { id:string; date:string; type:string; duration_min:number|null }

export default function AnalysisPage() {
  const { user, profile } = useAuth()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    if (!user) return
    const [m, w] = await Promise.all([
      supabase.from('body_metrics').select('id,date,weight_kg,body_fat_pct,waist_cm,chest_cm,hip_cm,bicep_left_cm,thigh_left_cm').eq('user_id', user.id).order('date'),
      supabase.from('workouts').select('id,date,type,duration_min').eq('user_id', user.id).order('date'),
    ])
    setMetrics(m.data||[]); setWorkouts(w.data||[])
  }

  const labels = metrics.map(m => new Date(m.date+'T12:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}))
  const multiChart = {
    labels,
    datasets: [
      { label:'Peso (kg)', data: metrics.map(m=>m.weight_kg), borderColor:'#10b981', fill:false, tension:0.4, borderWidth:2, pointRadius:3 },
      { label:'Cintura (cm)', data: metrics.map(m=>m.waist_cm), borderColor:'#ef4444', fill:false, tension:0.4, borderWidth:2, pointRadius:3 },
      { label:'Peito (cm)', data: metrics.map(m=>m.chest_cm), borderColor:'#3b82f6', fill:false, tension:0.4, borderWidth:2, pointRadius:3 },
    ],
  }

  const monthlyWorkouts: Record<string,number> = {}
  workouts.forEach(w => { const key = new Date(w.date+'T12:00:00').toLocaleDateString('pt-BR', {month:'short', year:'2-digit'}); monthlyWorkouts[key] = (monthlyWorkouts[key]||0)+1 })
  const barData = { labels: Object.keys(monthlyWorkouts), datasets: [{ label:'Treinos', data: Object.values(monthlyWorkouts), backgroundColor:'rgba(16,185,129,0.6)', borderColor:'#10b981', borderWidth:1, borderRadius:6 }] }

  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins: { legend:{ labels:{color:'#94a3b8'} }, tooltip:{ backgroundColor:'rgba(15,23,42,0.9)', titleColor:'#f1f5f9', bodyColor:'#94a3b8', padding:12, cornerRadius:8 } },
    scales: { x:{ ticks:{color:'#64748b'}, grid:{color:'rgba(148,163,184,0.06)'} }, y:{ ticks:{color:'#64748b'}, grid:{color:'rgba(148,163,184,0.06)'} } },
  }

  const first = metrics[0]; const last = metrics[metrics.length-1]
  const weightDiff = first?.weight_kg && last?.weight_kg ? (last.weight_kg - first.weight_kg).toFixed(1) : null
  const waistDiff = first?.waist_cm && last?.waist_cm ? (last.waist_cm - first.waist_cm).toFixed(1) : null
  const heightM = profile?.height_cm ? profile.height_cm/100 : null
  const bmiFirst = first?.weight_kg && heightM ? (first.weight_kg/(heightM*heightM)).toFixed(1) : null
  const bmiLast = last?.weight_kg && heightM ? (last.weight_kg/(heightM*heightM)).toFixed(1) : null
  const totalMinutes = workouts.reduce((a,w) => a+(w.duration_min||0), 0)

  return (
    <div className="animate-slide-up">
      <div className="page-header"><h1>Análise Detalhada</h1><p>Visão completa da sua evolução</p></div>

      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card accent-green"><div className="stat-card-icon"><IconScale size={22} color="var(--accent-primary)" /></div><div className="stat-card-value">{weightDiff ? `${Number(weightDiff)>0?'+':''}${weightDiff} kg` : '—'}</div><div className="stat-card-label">Variação de peso total</div></div>
        <div className="stat-card accent-blue"><div className="stat-card-icon"><IconRuler size={22} color="var(--accent-secondary)" /></div><div className="stat-card-value">{waistDiff ? `${Number(waistDiff)>0?'+':''}${waistDiff} cm` : '—'}</div><div className="stat-card-label">Variação de cintura</div></div>
        <div className="stat-card accent-purple"><div className="stat-card-icon"><IconActivity size={22} color="var(--accent-purple)" /></div><div className="stat-card-value">{bmiFirst && bmiLast ? `${bmiFirst} → ${bmiLast}` : '—'}</div><div className="stat-card-label">IMC (início → atual)</div></div>
        <div className="stat-card accent-yellow"><div className="stat-card-icon"><IconClock size={22} color="var(--accent-warning)" /></div><div className="stat-card-value">{Math.round(totalMinutes/60)}h</div><div className="stat-card-label">{workouts.length} treinos totais</div></div>
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title"><IconTrendingUp size={18} /> Evolução Comparativa</h3></div>
          {metrics.length > 1 ? <div className="chart-container"><Line data={multiChart} options={chartOpts} /></div> : (
            <div className="empty-state"><div className="empty-state-icon"><IconTrendingUp size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Dados insuficientes</div></div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title"><IconBarChart size={18} /> Frequência Mensal</h3></div>
          {Object.keys(monthlyWorkouts).length > 0 ? <div className="chart-container"><Bar data={barData} options={chartOpts} /></div> : (
            <div className="empty-state"><div className="empty-state-icon"><IconDumbbell size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Sem treinos</div></div>
          )}
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="card">
          <div className="card-header"><h3 className="card-title"><IconClipboard size={18} /> Resumo Mensal</h3></div>
          <div className="table-wrapper"><table className="table"><thead><tr><th>Mês</th><th>Peso Médio</th><th>Cintura Média</th><th>Treinos</th></tr></thead><tbody>
            {(() => {
              const months: Record<string, {weights:number[], waists:number[], workoutCount:number}> = {}
              metrics.forEach(m => { const key = new Date(m.date+'T12:00:00').toLocaleDateString('pt-BR', {month:'long', year:'numeric'}); if (!months[key]) months[key]={weights:[],waists:[],workoutCount:0}; if (m.weight_kg) months[key].weights.push(m.weight_kg); if (m.waist_cm) months[key].waists.push(m.waist_cm) })
              workouts.forEach(w => { const key = new Date(w.date+'T12:00:00').toLocaleDateString('pt-BR', {month:'long', year:'numeric'}); if (!months[key]) months[key]={weights:[],waists:[],workoutCount:0}; months[key].workoutCount++ })
              const avg = (arr:number[]) => arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : '—'
              return Object.entries(months).reverse().map(([month, d]) => (
                <tr key={month}><td style={{fontWeight:600, color:'var(--text-primary)', textTransform:'capitalize'}}>{month}</td><td>{avg(d.weights)} kg</td><td>{avg(d.waists)} cm</td><td>{d.workoutCount}</td></tr>
              ))
            })()}
          </tbody></table></div>
        </div>
      )}
    </div>
  )
}
