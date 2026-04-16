import { useState } from 'react'

export default function RangeInput({ label, min, max, step = 1, value, onChange, prefix = '', suffix = '' }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>{label}</span>
        <span style={styles.value}>
          {prefix}{value}{suffix}
        </span>
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
    alignItems: 'baseline',
    marginBottom: '8px'
  },
  label: { fontSize: '11px', fontWeight: '900', color: '#087ca7', textTransform: 'uppercase' },
  value: { fontSize: '20px', fontWeight: '900', color: '#04f06a' },
  slider: {
    appearance: 'none',
    width: '100%',
    height: '4px',
    background: '#1a1a1a',
    outline: 'none',
    cursor: 'pointer',
    accentColor: '#04f06a'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '6px',
    fontSize: '9px',
    fontWeight: '700',
    color: '#84596b',
    textTransform: 'uppercase'
  }
}
