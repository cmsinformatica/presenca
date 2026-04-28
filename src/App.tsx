import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage, DashboardPage, EventoPage, PortariaPage, ParticipantePage, ConfirmarPage } from './pages'
import { useAuthStore } from './stores'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/evento/:id" element={
          <ProtectedRoute>
            <EventoPage />
          </ProtectedRoute>
        } />
        <Route path="/portaria" element={
          <ProtectedRoute>
            <PortariaPage />
          </ProtectedRoute>
        } />
        <Route path="/portaria/:eventoId" element={
          <ProtectedRoute>
            <PortariaPage />
          </ProtectedRoute>
        } />
        <Route path="/p/:qrCode" element={<ParticipantePage />} />
        <Route path="/confirmar/:codigo" element={<ConfirmarPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}