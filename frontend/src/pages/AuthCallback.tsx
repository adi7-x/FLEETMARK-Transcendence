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
    const run = async () => {
      const code = params.get('code')
      if (!code) {
        navigate('/', { replace: true })
        return
      }

      try {
        const tokens = await handleOAuthCallback(code)
        login(tokens)

        const user = tokens.user
        if (user.role === 'LOGISTICS_STAFF') {
          navigate('/admin', { replace: true })
        } else if (user.role === 'DRIVER') {
          navigate('/driver', { replace: true })
        } else if (user.role === 'STUDENT') {
          if (!user.station) navigate('/onboarding', { replace: true })
          else navigate('/student', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Auth callback failed', error)
        navigate('/?error=auth_failed', { replace: true })
      }
    }

    run()
  }, [navigate, params, login])

  return <Spinner text="Signing you in…" />
}
