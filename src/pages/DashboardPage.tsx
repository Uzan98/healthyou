import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { IconScale, IconPercent, IconActivity, IconDumbbell, IconRuler, IconCamera, IconTarget, IconTrendingUp } from '../components/Icons'
import HealthAlerts from '../components/HealthAlerts'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface BodyMetric { id:string; date:string; weight_kg:number|null; body_fat_pct:number|null; waist_cm:number|null; hip_cm:number|null; chest_cm:number|null }
interface Workout { id:string; date:string; type:string }
interface Goal { id:string; title:string; target_value:number; current_value:number; unit:string; status:string }

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  const [period, setPeriod] = useState<30|90|365>(90)

  useEffect(() => { if (user) loadData() }, [user, period])

  const loadData = async () => {
    if (!user) return
    const since = new Date(); since.setDate(since.getDate() - period)
    const sinceStr = since.toISOString().split('T')[0]
    const [metricsRes, workoutsRes, goalsRes, photosRes] = await Promise.all([
      supabase.from('body_metrics').select('id, date, weight_kg, body_fat_pct, waist_cm, hip_cm, chest_cm').eq('user_id', user.id).gte('date', sinceStr).order('date'),
      supabase.from('workouts').select('id, date, type').eq('user_id', user.id).gte('date', sinceStr).order('date'),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'ativa'),
      supabase.from('progress_photos').select('id', { count: 'exact' }).eq('user_id', user.id),
    ])
    setMetrics(metricsRes.data||[]); setWorkouts(workoutsRes.data||[]); setGoals(goalsRes.data||[]); setPhotoCount(photosRes.count||0)
  }

  const latestWeight = metrics.length ? metrics[metrics.length-1].weight_kg : null
  const latestFat = metrics.length ? metrics[metrics.length-1].body_fat_pct : null
  const firstWeight = metrics.length ? metrics[0].weight_kg : null
  const weightChange = latestWeight && firstWeight ? (latestWeight - firstWeight).toFixed(1) : null
  const heightM = profile?.height_cm ? profile.height_cm / 100 : null
  const bmi = latestWeight && heightM ? (latestWeight / (heightM * heightM)).toFixed(1) : null
  const now = new Date(); const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay())
  const weekWorkouts = workouts.filter(w => new Date(w.date) >= weekStart).length

  const chartData = {
    labels: metrics.map(m => new Date(m.date+'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })),
    datasets: [{ label:'Peso (kg)', data: metrics.map(m => m.weight_kg), borderColor:'#10b981', backgroundColor:'rgba(16,185,129,0.1)', fill:true, tension:0.4, pointRadius:3, pointHoverRadius:6, borderWidth:2 }],
  }
  const chartOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins: { legend:{display:false}, tooltip:{ backgroundColor:'rgba(15,23,42,0.9)', titleColor:'#f1f5f9', bodyColor:'#94a3b8', borderColor:'rgba(148,163,184,0.1)', borderWidth:1, padding:12, cornerRadius:8 } },
    scales: { x:{ ticks:{color:'#64748b', font:{size:11}}, grid:{color:'rgba(148,163,184,0.06)'} }, y:{ ticks:{color:'#64748b', font:{size:11}}, grid:{color:'rgba(148,163,184,0.06)'} } },
  }

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Bem-vindo de volta{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}! Aqui está seu resumo.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent-green">
          <div className="stat-card-icon"><IconScale size={24} color="var(--accent-primary)" /></div>
          <div className="stat-card-value">{latestWeight ? `${latestWeight} kg` : '—'}</div>
          <div className="stat-card-label">Peso Atual</div>
          {weightChange && <div className={`stat-card-change ${Number(weightChange)<=0?'positive':'negative'}`}>{Number(weightChange)>0?'↑':'↓'} {Math.abs(Number(weightChange))} kg no período</div>}
        </div>
        <div className="stat-card accent-blue">
          <div className="stat-card-icon"><IconPercent size={24} color="var(--accent-secondary)" /></div>
          <div className="stat-card-value">{latestFat ? `${latestFat}%` : '—'}</div>
          <div className="stat-card-label">Gordura Corporal</div>
        </div>
        <div className="stat-card accent-purple">
          <div className="stat-card-icon"><IconActivity size={24} color="var(--accent-purple)" /></div>
          <div className="stat-card-value">{bmi || '—'}</div>
          <div className="stat-card-label">IMC</div>
          {bmi && <div className="stat-card-change" style={{color:'var(--text-tertiary)'}}>{Number(bmi)<18.5?'Abaixo do peso':Number(bmi)<25?'Normal':Number(bmi)<30?'Sobrepeso':'Obeso'}</div>}
        </div>
        <div className="stat-card accent-yellow">
          <div className="stat-card-icon"><IconDumbbell size={24} color="var(--accent-warning)" /></div>
          <div className="stat-card-value">{weekWorkouts}</div>
          <div className="stat-card-label">Treinos esta semana</div>
        </div>
      </div>

      <HealthAlerts
        latestMetrics={metrics.length > 0 ? metrics[metrics.length - 1] : null}
        previousMetrics={metrics.length > 1 ? metrics[metrics.length - 2] : null}
        profile={profile}
      />

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><IconTrendingUp size={18} /> Evolução de Peso</h3>
            <div className="tabs" style={{ marginBottom:0, padding:2 }}>
              {[30,90,365].map(p => <button key={p} className={`tab ${period===p?'active':''}`} onClick={() => setPeriod(p as 30|90|365)}>{p===365?'1A':`${p}D`}</button>)}
            </div>
          </div>
          {metrics.length > 1 ? <div className="chart-container"><Line data={chartData} options={chartOptions} /></div> : (
            <div className="empty-state"><div className="empty-state-icon"><IconTrendingUp size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Sem dados suficientes</div><div className="empty-state-sub">Registre pelo menos 2 medidas para ver o gráfico</div></div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><h3 className="card-title"><IconTarget size={18} /> Metas Ativas</h3></div>
          {goals.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {goals.slice(0,4).map(goal => {
                const pct = goal.target_value !== 0 ? Math.min(100, Math.max(0, (goal.current_value/goal.target_value)*100)) : 0
                return (<div key={goal.id} className="goal-card" style={{padding:16}}>
                  <div className="goal-card-header" style={{marginBottom:8}}><span className="goal-card-title" style={{fontSize:'0.85rem'}}>{goal.title}</span><span style={{fontSize:'0.8rem', color:'var(--accent-primary)', fontWeight:700}}>{pct.toFixed(0)}%</span></div>
                  <div className="goal-progress-bar"><div className="goal-progress-fill" style={{width:`${pct}%`}}/></div>
                  <div className="goal-progress-values"><span>{goal.current_value} {goal.unit}</span><span>{goal.target_value} {goal.unit}</span></div>
                </div>)
              })}
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon"><IconTarget size={40} color="var(--text-tertiary)" /></div><div className="empty-state-text">Nenhuma meta ativa</div><div className="empty-state-sub">Crie metas para acompanhar seu progresso</div></div>
          )}
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card"><div className="stat-card-icon"><IconRuler size={22} color="var(--text-secondary)" /></div><div className="stat-card-value">{metrics.length}</div><div className="stat-card-label">Registros de medidas</div></div>
        <div className="stat-card"><div className="stat-card-icon"><IconCamera size={22} color="var(--text-secondary)" /></div><div className="stat-card-value">{photoCount}</div><div className="stat-card-label">Fotos de progresso</div></div>
        <div className="stat-card"><div className="stat-card-icon"><IconDumbbell size={22} color="var(--text-secondary)" /></div><div className="stat-card-value">{workouts.length}</div><div className="stat-card-label">Total de treinos</div></div>
        <div className="stat-card"><div className="stat-card-icon"><IconTarget size={22} color="var(--text-secondary)" /></div><div className="stat-card-value">{goals.length}</div><div className="stat-card-label">Metas ativas</div></div>
      </div>
    </div>
  )
}
