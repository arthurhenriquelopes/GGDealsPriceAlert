import { useState } from 'react'
import { Key, ShieldCheck, Zap } from 'lucide-react'
import axios from 'axios'

export default function GroqSetup({ userId, onConfigSaved }) {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Salva no backend Java que por sua vez salva no Supabase
      const config = {
        userId: userId,
        groqApiKey: key
      }
      
      const response = await axios.post('http://localhost:8080/api/config', config)
      onConfigSaved(response.data)
    } catch (error) {
      alert('Error saving configuration: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.iconWrapper}>
          <Zap size={32} color="#10b981" />
        </div>
        <h2 style={styles.title}>Activate AI Features</h2>
        <p style={styles.text}>
          To unlock the premium dashboard and AI-powered deal analysis, please enter your <strong>Groq API Key</strong>.
        </p>

        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.inputGroup}>
            <Key size={18} style={styles.icon} />
            <input
              type="password"
              placeholder="gsk_..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.infoBox}>
            <ShieldCheck size={16} />
            <span>Your key is stored securely in your private profile.</span>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Activating...' : 'Save & Unlock Dashboard'}
          </button>
        </form>

        <a 
          href="https://console.groq.com/keys" 
          target="_blank" 
          rel="noreferrer" 
          style={styles.link}
        >
          Get your free key at groq.com
        </a>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    padding: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0f1113'
  },
  modal: {
    background: '#1a1d1f',
    padding: '40px',
    borderRadius: '20px',
    maxWidth: '450px',
    textAlign: 'center',
    border: '1px solid #2f3336',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 20px auto'
  },
  title: { fontSize: '24px', fontWeight: '800', marginBottom: '15px' },
  text: { color: '#9ca3af', lineHeight: '1.6', fontSize: '15px', marginBottom: '25px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    background: '#0f1113',
    borderRadius: '10px',
    border: '1px solid #2f3336',
    padding: '0 15px'
  },
  icon: { color: '#6b7280' },
  input: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '15px',
    width: '100%',
    outline: 'none',
    fontSize: '14px'
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#10b981',
    opacity: 0.8
  },
  button: {
    background: '#10b981',
    color: '#fff',
    padding: '15px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '800',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s'
  },
  link: {
    display: 'inline-block',
    marginTop: '25px',
    color: '#6b7280',
    fontSize: '13px',
    textDecoration: 'none',
    borderBottom: '1px solid #2f3336'
  }
}
