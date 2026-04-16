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
    alignItems: 'center',
    minHeight: '100vh',
    color: '#e8f1f2',
    background: '#000'
  },
  card: {
    background: '#0a0a0a',
    padding: '40px',
    borderRadius: '2px', // Sharp corners
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 0 40px rgba(0,0,0,0.8)',
    textAlign: 'center',
    border: '1px solid #1a1a1a'
  },
  title: { fontSize: '24px', margin: '0 0 10px 0', fontWeight: '900', letterSpacing: '-0.5px' },
  subtitle: { color: '#84596b', fontSize: '13px', marginBottom: '30px', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: '#000',
    borderRadius: '2px',
    border: '1px solid #1a1a1a'
  },
  icon: { marginLeft: '12px', color: '#087ca7' },
  input: {
    background: 'transparent',
    border: 'none',
    color: '#e8f1f2',
    padding: '12px',
    width: '100%',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    background: '#04f06a', // Neon Green
    color: '#000',
    padding: '12px',
    borderRadius: '2px',
    border: 'none',
    fontSize: '15px',
    fontWeight: '900',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '10px',
    textTransform: 'uppercase'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#087ca7',
    marginTop: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700'
  }
}
