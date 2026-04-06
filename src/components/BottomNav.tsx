import { NavLink, useLocation } from 'react-router-dom'
import { IconDashboard, IconRuler, IconCamera, IconDumbbell, IconTarget, IconUser } from './Icons'

const navItems = [
  { path: '/', icon: <IconDashboard size={20} />, label: 'Início' },
  { path: '/medidas', icon: <IconRuler size={20} />, label: 'Medidas' },
  { path: '/fotos', icon: <IconCamera size={20} />, label: 'Fotos' },
  { path: '/treinos', icon: <IconDumbbell size={20} />, label: 'Treinos' },
  { path: '/metas', icon: <IconTarget size={20} />, label: 'Metas' },
  { path: '/perfil', icon: <IconUser size={20} />, label: 'Perfil' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
