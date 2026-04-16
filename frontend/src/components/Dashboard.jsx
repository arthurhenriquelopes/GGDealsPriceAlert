import { useState, useEffect } from 'react'
import FilterGroup from './FilterGroup'
import CheckboxGroup from './CheckboxGroup'
import RangeInput from './RangeInput'
import { Save, ShoppingCart, Shield, Monitor, Percent, Star } from 'lucide-react'
import axios from 'axios'

const STORES = [
  { id: 1, name: 'Steam' }, { id: 2, name: 'Epic Games Store' }, { id: 3, name: 'GOG.com' },
  { id: 4, name: 'Humble Store' }, { id: 10, name: 'Ubisoft Store' }, { id: 11, name: 'Microsoft Store' },
  { id: 13, name: 'Fanatical' }, { id: 15, name: 'Gamesplanet' }, { id: 17, name: 'IndieGala' },
  { id: 19, name: 'Green Man Gaming' }, { id: 33, name: 'GameBillet' }, { id: 34, name: 'CDKeys' },
  { id: 35, name: 'Eneba' }, { id: 36, name: 'Instant Gaming' }, { id: 37, name: 'Gamivo' },
  { id: 38, name: 'Kinguin' }
]

const DRMS = [
  { id: 1, name: 'Steam' }, { id: 2, name: 'EGS' }, { id: 3, name: 'GOG' },
  { id: 4, name: 'Uplay' }, { id: 5, name: 'Origin' }, { id: 6, name: 'DRM Free' }
]

export default function Dashboard({ userId, initialConfig }) {
  const [config, setConfig] = useState(initialConfig || {
    userId: userId,
    platformFamily: 'pc',
    minRating: 5,
    maxPrice: 20,
    onlyHistoricalLow: false,
    stores: STORES.map(s => s.id).join(','),
    drms: DRMS.map(d => d.id).join(','),
    emailReceiver: ''
  })
  
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.post('http://localhost:8080/api/config', config)
      alert('Alert configuration saved successfully!')
    } catch (e) {
      alert('Error saving config: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleListValue = (key, value, items) => {
    const current = config[key] ? config[key].split(',').map(Number) : []
    const updated = items // Expecting items to be the new array from CheckboxGroup
    setConfig({ ...config, [key]: updated.join(',') })
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainGrid}>
        {/* Core Filters */}
        <div style={styles.sidebar}>
          <FilterGroup title="Main Filters" icon={Monitor}>
            <RangeInput 
              label="Max Price" 
              min={0} max={100} 
              prefix="$" 
              value={config.maxPrice} 
              onChange={(val) => setConfig({...config, maxPrice: val})} 
            />
            <RangeInput 
              label="Min Rating" 
              min={0} max={10} 
              value={config.minRating} 
              onChange={(val) => setConfig({...config, minRating: val})} 
              suffix="/10"
            />
            
            <div 
              style={styles.toggleRow} 
              onClick={() => setConfig({...config, onlyHistoricalLow: !config.onlyHistoricalLow})}
            >
              <div style={styles.toggleLabel}>
                <Percent size={14} style={{ marginRight: '8px' }}/>
                Only Historical Lows
              </div>
              <div style={{
                ...styles.toggleSwitch,
                background: config.onlyHistoricalLow ? '#fff' : '#1a1a1a'
              }}>
                <div style={{
                  ...styles.toggleThumb,
                  background: config.onlyHistoricalLow ? '#000' : '#888',
                  transform: config.onlyHistoricalLow ? 'translateX(16px)' : 'translateX(0px)'
                }}/>
              </div>
            </div>
          </FilterGroup>

          <button 
            onClick={handleSave} 
            disabled={saving} 
            style={styles.saveBtn}
          >
            {saving ? 'Saving...' : <><Save size={18}/> Save Alert Policy</>}
          </button>
        </div>

        {/* Store & DRM Grids */}
        <div style={styles.content}>
          <div style={styles.contentGrid}>
            <FilterGroup title="Target Stores" icon={ShoppingCart}>
              <CheckboxGroup 
                items={STORES} 
                selectedItems={config.stores ? config.stores.split(',').map(Number) : []}
                onChange={(items) => setConfig({...config, stores: items.join(',')})}
              />
            </FilterGroup>

            <FilterGroup title="Preferred DRM" icon={Shield}>
              <CheckboxGroup 
                items={DRMS} 
                selectedItems={config.drms ? config.drms.split(',').map(Number) : []}
                onChange={(items) => setConfig({...config, drms: items.join(',')})}
              />
            </FilterGroup>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { width: '100%', maxWidth: '1200px', margin: '0 auto' },
  mainGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
  content: { display: 'flex', flexDirection: 'column', gap: '20px' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '20px' },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    cursor: 'pointer'
  },
  toggleLabel: { fontSize: '12px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center' },
  toggleSwitch: { width: '36px', height: '20px', borderRadius: '2px', position: 'relative', transition: '0.2s' },
  toggleThumb: { width: '16px', height: '16px', background: '#000', position: 'absolute', top: '2px', left: '2px', transition: '0.2s' },
  saveBtn: {
    background: '#fff',
    color: '#000',
    padding: '16px',
    borderRadius: '2px',
    border: 'none',
    fontWeight: '900',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    textTransform: 'uppercase',
    marginTop: '10px',
    letterSpacing: '1px'
  }
}
