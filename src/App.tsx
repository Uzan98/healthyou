import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MetricsPage from './pages/MetricsPage'
import PhotosPage from './pages/PhotosPage'
import WorkoutsPage from './pages/WorkoutsPage'
import GoalsPage from './pages/GoalsPage'
import AnalysisPage from './pages/AnalysisPage'
import ProfilePage from './pages/ProfilePage'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/medidas" element={<MetricsPage />} />
            <Route path="/fotos" element={<PhotosPage />} />
            <Route path="/treinos" element={<WorkoutsPage />} />
            <Route path="/metas" element={<GoalsPage />} />
            <Route path="/analise" element={<AnalysisPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
