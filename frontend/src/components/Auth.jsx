import { useState } from 'react'
import { supabase } from '../supabase'
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react'

export default function Auth({ onSessionChange }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { data, error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
    } else if (isSignUp) {
      alert('Check your email for the confirmation link!')
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-container" style={styles.container}>
      <div className="auth-card" style={styles.card}>
        <h1 style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
        <p style={styles.subtitle}>
          {isSignUp ? 'Join the ultimate deal hunting community' : 'Login to manage your game alerts'}
        </p>

        <form onSubmit={handleAuth} style={styles.form}>
          <div style={styles.inputGroup}>
            <Mail size={18} style={styles.icon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} style={styles.icon} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Processing...' : (isSignUp ? <><UserPlus size={18}/> Sign Up</> : <><LogIn size={18}/> Login</>)}
          </button>
        </form>

        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          style={styles.toggleBtn}
        >
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    minHeight: '80vh',
    color: '#fff'
  },
  card: {
    background: '#1a1d1f',
    padding: '40px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    textAlign: 'center',
    border: '1px solid #2f3336'
  },
  title: { fontSize: '24px', margin: '0 0 10px 0' },
  subtitle: { color: '#9ca3af', fontSize: '14px', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#0f1113',
    borderRadius: '8px',
    border: '1px solid #2f3336'
  },
  icon: { marginLeft: '12px', color: '#6b7280' },
  input: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '12px',
    width: '100%',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    background: '#10b981',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    marginTop: '20px',
    cursor: 'pointer',
    fontSize: '14px'
  }
}
