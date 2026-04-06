import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content animate-fade-in">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
