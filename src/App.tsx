import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/organizer/Login'
import Dashboard from './pages/organizer/Dashboard'
import EventDetails from './pages/organizer/EventDetails'
import Confirm from './pages/participant/Confirm'
import QRCodePage from './pages/participant/QRCodePage'
import Checkin from './pages/portaria/Checkin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/confirmar/:qrCode" element={<Confirm />} />
      <Route path="/qr/:qrCode" element={<QRCodePage />} />
      <Route path="/checkin/:eventId" element={<Checkin />} />
    </Routes>
  )
}