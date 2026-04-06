import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { IconSave, IconLoader, IconUser, IconCheck } from '../components/Icons'

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const [form, setForm] = useState({
    name: '',
    age: '',
    height_cm: '',
    sex: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        age: profile.age?.toString() || '',
        height_cm: profile.height_cm?.toString() || '',
        sex: profile.sex || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await updateProfile({
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      sex: form.sex || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const completionItems = [
    { label: 'Nome', done: !!form.name },
    { label: 'Idade', done: !!form.age },
    { label: 'Altura', done: !!form.height_cm },
    { label: 'Sexo', done: !!form.sex },
  ]
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100)

  return (
    <div className="animate-slide-up">
      <div className="page-header">
        <h1>Perfil</h1>
        <p>Gerencie seus dados pessoais</p>
      </div>

      <div className="grid-2">
        {/* Profile Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><IconUser size={18} /> Dados Pessoais</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Seu nome"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
              <div className="form-hint">O email não pode ser alterado</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Idade</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="25"
                  min="10"
                  max="120"
                  value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Altura (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="175"
                  step="0.1"
                  min="100"
                  max="250"
                  value={form.height_cm}
                  onChange={e => setForm({ ...form, height_cm: e.target.value })}
                />
                <div className="form-hint">Necessário para calcular o IMC</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Sexo biológico</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Feminino' },
                  { value: 'Outro', label: 'Outro' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={form.sex === option.value ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ flex: 1 }}
                    onClick={() => setForm({ ...form, sex: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="form-hint">Usado para calcular limiares de saúde (cintura, gordura corporal)</div>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? <><IconLoader size={15} className="icon-spin" /> Salvando...</>
                  : saved
                  ? <><IconCheck size={15} /> Salvo!</>
                  : <><IconSave size={15} /> Salvar Alterações</>}
              </button>
              {saved && (
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                  Perfil atualizado com sucesso
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Profile Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar & Summary Card */}
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 800, color: 'white',
              margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)',
            }}>
              {form.name
                ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                : <IconUser size={32} color="white" />}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
              {form.name || 'Seu Nome'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
              {user?.email}
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
              padding: '16px 0', borderTop: '1px solid var(--border-color)',
            }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {form.age || '—'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Anos
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {form.height_cm ? `${form.height_cm} cm` : '—'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Altura
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {form.sex === 'M' ? 'Masc.' : form.sex === 'F' ? 'Fem.' : form.sex || '—'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sexo
                </div>
              </div>
            </div>
          </div>

          {/* Completion Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Completude do Perfil</h3>
              <span style={{
                fontSize: '0.85rem', fontWeight: 700,
                color: completionPct === 100 ? 'var(--accent-primary)' : 'var(--accent-warning)',
              }}>
                {completionPct}%
              </span>
            </div>

            <div className="goal-progress-bar" style={{ marginBottom: 16 }}>
              <div
                className={`goal-progress-fill ${completionPct === 100 ? 'complete' : ''}`}
                style={{ width: `${completionPct}%` }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completionItems.map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: '0.88rem',
                  color: item.done ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: item.done ? 'var(--accent-primary-dim)' : 'var(--bg-secondary)',
                    color: item.done ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    border: item.done ? 'none' : '1px solid var(--border-color)',
                    flexShrink: 0,
                  }}>
                    {item.done ? <IconCheck size={12} /> : <span style={{ fontSize: '0.6rem' }}>—</span>}
                  </span>
                  <span style={{ textDecoration: item.done ? 'none' : 'none' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Why it matters */}
          <div className="card" style={{
            borderLeft: '3px solid var(--accent-secondary)',
          }}>
            <h4 style={{
              fontSize: '0.85rem', fontWeight: 700, marginBottom: 10,
              color: 'var(--accent-secondary)',
            }}>
              Por que preencher o perfil?
            </h4>
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              {[
                'A altura é necessária para calcular seu IMC automaticamente.',
                'O sexo biológico define os limiares de saúde para cintura, gordura corporal e relação cintura/quadril.',
                'A idade ajuda na interpretação dos seus indicadores.',
                'Com perfil completo, os alertas de saúde ficam mais precisos e personalizados.',
              ].map((text, i) => (
                <li key={i} style={{
                  fontSize: '0.83rem', color: 'var(--text-secondary)',
                  lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start',
                }}>
                  <span style={{ color: 'var(--accent-secondary)', flexShrink: 0, fontWeight: 600 }}>→</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{
            borderLeft: '3px solid var(--accent-danger)',
          }}>
            <h4 style={{
              fontSize: '0.85rem', fontWeight: 700, marginBottom: 10,
              color: 'var(--accent-danger)',
            }}>
              Zona de Perigo
            </h4>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-tertiary)', marginBottom: 12, lineHeight: 1.5 }}>
              Encerrar sua sessão atual. Você precisará fazer login novamente.
            </p>
            <button className="btn btn-danger" onClick={signOut}>
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
