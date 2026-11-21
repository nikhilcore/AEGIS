
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MainLayout from './components/layout/MainLayout'

function AppContent() {
  const { user, loading } = useAuth()
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FF]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#E5E7F0] border-t-[#6045F5]" />
          <p className="text-sm font-medium text-[#687086]">
            Initialising AEGIS...
          </p>
        </div>
      </div>
    )
  }

  if (user) {
    return <MainLayout />
  }

  if (authScreen === 'signup') {
    return <Signup onBackToLogin={() => setAuthScreen('login')} />
  }

  return <Login onSignup={() => setAuthScreen('signup')} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
