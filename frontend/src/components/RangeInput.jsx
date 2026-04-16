import { useState } from 'react'
import { Flame } from 'lucide-react'

export default function RangeInput({ label, min, max, step = 1, value, onChange, prefix = '', suffix = '' }) {
  const isRating = label.toLowerCase().includes('rating')

  const getFlameColor = () => {
    if (value >= 8) return '#ef4444' // Red Fire
    if (value >= 6) return '#f97316' // Orange Fire
    return '#404040' // Graphite inactive
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>{label}</span>
        <div style={styles.valueGroup}>
          {isRating && <Flame size={16} color={getFlameColor()} />}
          <span style={styles.value}>
            {prefix}{value}{suffix}
          </span>
        </div>
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={styles.slider}
      />
      
      <div style={styles.footer}>
        <span>{prefix}{min}{suffix}</span>
        <span>{prefix}{max}{suffix}</span>
      </div>
    </div>
  )
}

const styles = {
  container: { width: '100%', marginBottom: '15px' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  label: { fontSize: '11px', fontWeight: '800', color: '#888', textTransform: 'uppercase' },
  valueGroup: { display: 'flex', alignItems: 'center', gap: '6px' },
  value: { fontSize: '18px', fontWeight: '900', color: '#fff' },
  slider: {
    appearance: 'none',
    width: '100%',
    height: '4px',
    background: '#333',
    outline: 'none',
    cursor: 'pointer',
    accentColor: '#fff'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '6px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase'
  }
}
