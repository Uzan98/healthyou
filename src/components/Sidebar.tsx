import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { IconDashboard, IconRuler, IconCamera, IconDumbbell, IconTarget, IconTrendingUp, IconLogOut, IconMenu, IconHeart, IconUser } from './Icons'

const navItems = [
  { path: '/', icon: <IconDashboard size={18} />, label: 'Dashboard' },
  { path: '/medidas', icon: <IconRuler size={18} />, label: 'Medidas' },
  { path: '/fotos', icon: <IconCamera size={18} />, label: 'Fotos' },
  { path: '/treinos', icon: <IconDumbbell size={18} />, label: 'Treinos' },
  { path: '/metas', icon: <IconTarget size={18} />, label: 'Metas' },
  { path: '/analise', icon: <IconTrendingUp size={18} />, label: 'Análise' },
]

export default function Sidebar() {
  const { profile, user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || '?'

  return (
    <>
      <button className="mobile-toggle" onClick={() => setMobileOpen(true)}><IconMenu size={20} /></button>
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><IconHeart size={22} color="white" /></div>
          <h2>Health<span>+</span></h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/perfil"
            className={`sidebar-link ${location.pathname === '/perfil' ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
            style={{ marginBottom: 8 }}
          >
            <span className="sidebar-link-icon"><IconUser size={18} /></span>
            Perfil
          </NavLink>
          <div className="sidebar-user" style={{ cursor: 'pointer' }} onClick={() => { navigate('/perfil'); setMobileOpen(false) }}>
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.name || 'Usuário'}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
            <button className="sidebar-logout" onClick={e => { e.stopPropagation(); signOut() }} title="Sair"><IconLogOut size={16} /></button>
          </div>
        </div>
      </aside>
    </>
  )
}
