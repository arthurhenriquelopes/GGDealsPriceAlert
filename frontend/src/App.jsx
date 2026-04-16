import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import { LayoutDashboard } from 'lucide-react'
import axios from 'axios'

function App() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  const defaultUserId = "default-user"

  useEffect(() => {
    fetchConfig(defaultUserId)
  }, [])

  const fetchConfig = async (userId) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/api/config/${userId}`)
      setConfig(data)
    } catch (e) {
      console.log("No config found for user yet.")
      // We start with a null config, which triggers Dashboard's default
      setConfig(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={styles.loader}>INITIALIZING SYSTEM...</div>

  return (
    <div className="dashboard-layout" style={styles.layout}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <LayoutDashboard size={22} color="#fff" />
          <span style={styles.brandText}>GGDEALS PRICE ALERT</span>
        </div>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2 style={styles.title}>DASHBOARD OVERVIEW</h2>
        </header>
        
        <Dashboard userId={defaultUserId} initialConfig={config} />
      </main>
    </div>
  )
}

const styles = {
  loader: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fff', fontWeight: '900' },
  layout: { minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandText: { fontSize: '18px', fontWeight: '900', letterSpacing: '1px' },
  main: { padding: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  title: { fontWeight: '900', fontSize: '24px', letterSpacing: '-0.5px' },
}

export default App
