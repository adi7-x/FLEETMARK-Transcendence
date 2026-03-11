import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { handleOAuthCallback } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const code = params.get('code')
    if (!code) { navigate('/'); return }

    handleOAuthCallback(code)
      .then(tokens => {
        login(tokens)
        const r = tokens.user.role
        if (r === 'LOGISTICS_STAFF') navigate('/admin')
        else if (r === 'STUDENT') navigate(tokens.user.station ? '/student' : '/student/onboarding')
        else if (r === 'DRIVER') navigate('/driver')
        else navigate('/')
      })
      .catch(() => navigate('/?error=auth_failed'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <Spinner text="Signing you in…" />
}
