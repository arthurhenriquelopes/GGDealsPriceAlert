import { useState } from 'react'
import { Flame } from 'lucide-react'

export default function RangeInput({ label, min, max, step = 1, value, onChange, prefix = '', suffix = '' }) {
  const isRating = label.toLowerCase().includes('rating')

  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)

  const getFlameColor = () => {
    if (value >= 8) return '#ef4444' // Red Fire
    if (value >= 6) return '#f97316' // Orange Fire
    return '#404040' // Graphite inactive
  }

  const handleBlurOrEnter = (e) => {
    if (e.type === 'blur' || e.key === 'Enter') {
      setIsEditing(false)
      const parsed = parseFloat(tempValue)
      if (!isNaN(parsed)) {
        let val = parsed
        if (val < min) val = min
        if (val > max) val = max
        onChange(val)
      } else {
        setTempValue(value)
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>{label}</span>
        <div style={styles.valueGroup}>
          {isRating && <Flame size={16} color={getFlameColor()} />}
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{...styles.value, marginRight: '2px'}}>{prefix}</span>
              <input
                type="number"
                value={tempValue}
                onChange={e => setTempValue(e.target.value)}
                onBlur={handleBlurOrEnter}
                onKeyDown={handleBlurOrEnter}
                autoFocus
                style={styles.numberInput}
              />
              <span style={{...styles.value, marginLeft: '2px'}}>{suffix}</span>
            </div>
          ) : (
            <span style={styles.value} onClick={() => { setIsEditing(true); setTempValue(value) }} title="Click to edit">
              {prefix}{value}{suffix}
            </span>
          )}
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
  value: { fontSize: '18px', fontWeight: '900', color: '#fff', cursor: 'pointer' },
  numberInput: { width: '40px', background: 'transparent', border: 'none', borderBottom: '1px solid #666', color: '#fff', fontSize: '18px', fontWeight: '900', textAlign: 'center', outline: 'none' },
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
