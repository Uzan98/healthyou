import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { IconHeart, IconLoader } from '../components/Icons'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      if (!name.trim()) {
        setError('Digite seu nome')
        setLoading(false)
        return
      }
      const { error } = await signUp(email, password, name)
      if (error) {
        setError(error)
      } else {
        setSuccessMsg('Conta criada! Verifique seu email para confirmar o cadastro.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card animate-slide-up">
        <div className="login-logo">
          <div className="login-logo-icon"><IconHeart size={28} color="white" /></div>
          <h1>Health<span>+</span></h1>
          <p>Acompanhe sua evolução corporal</p>
        </div>

        {error && <div className="login-error">{error}</div>}
        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--accent-primary)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input type="text" className="form-input" placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? <IconLoader size={18} className="icon-spin" /> : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="login-toggle">
          {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg('') }}>
            {isLogin ? 'Criar conta' : 'Fazer login'}
          </button>
        </div>
      </div>
    </div>
  )
}
