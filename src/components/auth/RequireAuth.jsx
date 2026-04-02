import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, UserPlus, Lock } from 'lucide-react'
import useAuthStore from '../../stores/authStore'
import Button from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import Modal from '../ui/Modal'

/**
 * RequireAuth - Shows a login prompt modal instead of redirecting
 * Use this for actions that require auth but shouldn't leave the page
 */
export default function RequireAuth({ 
  children, 
  fallback = null,
  message = 'Please log in to continue'
}) {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)

  if (isAuthenticated) {
    return children
  }

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?returnUrl=${returnUrl}`)
  }

  const handleRegister = () => {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    navigate(`/register?returnUrl=${returnUrl}`)
  }

  // If fallback is provided, render it with a click handler to show modal
  if (fallback) {
    return (
      <>
        <div onClick={() => setShowModal(true)}>
          {fallback}
        </div>
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
          title="Authentication Required"
        >
          <AuthPrompt 
            message={message}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        </Modal>
      </>
    )
  }

  // Default: show auth prompt directly
  return (
    <AuthPrompt 
      message={message}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  )
}

function AuthPrompt({ message, onLogin, onRegister }) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Authentication Required</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex flex-col gap-3">
          <Button onClick={onLogin} className="w-full">
            <LogIn className="w-4 h-4 mr-2" />
            Log In
          </Button>
          <Button variant="outline" onClick={onRegister} className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Create Account
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
