import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores'

// Lazy-load pages for code-splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const EventoPage = lazy(() => import('./pages/EventoPage').then((m) => ({ default: m.EventoPage })))
const PortariaPage = lazy(() => import('./pages/PortariaPage').then((m) => ({ default: m.PortariaPage })))
const ParticipantePage = lazy(() => import('./pages/ParticipantePage').then((m) => ({ default: m.ParticipantePage })))
const ConfirmarPage = lazy(() => import('./pages/ConfirmarPage').then((m) => ({ default: m.ConfirmarPage })))

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    </div>
  )
}

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
      <Suspense fallback={<Loading />}>
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
      </Suspense>
    </BrowserRouter>
  )
}