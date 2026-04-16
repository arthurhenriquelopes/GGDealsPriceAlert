import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function FilterGroup({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div style={styles.group}>
      <header 
        style={styles.header} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={styles.titleWrapper}>
          {Icon && <Icon size={18} style={styles.icon} />}
          <span style={styles.title}>{title}</span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            ...styles.chevron, 
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' 
          }} 
        />
      </header>
      
      {isOpen && (
        <div style={styles.content}>
          {children}
        </div>
      )}
    </div>
  )
}

const styles = {
  group: {
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '2px', // Cantos retos
    marginBottom: '10px',
    overflow: 'hidden'
  },
  header: {
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    background: '#0a0a0a',
    borderBottom: '1px solid #1a1a1a'
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  icon: {
    color: '#fff'
  },
  title: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  chevron: {
    color: '#888',
    transition: 'transform 0.2s ease'
  },
  content: {
    padding: '16px',
    background: '#000'
  }
}
