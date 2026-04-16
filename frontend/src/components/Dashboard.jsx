import { useState } from 'react'
import FilterGroup from './FilterGroup'
import CheckboxGroup from './CheckboxGroup'
import RangeInput from './RangeInput'
import { Save, ShoppingCart, Shield, Monitor, Percent, Clock, Gamepad2, Award } from 'lucide-react'
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

const PLATFORMS = [
  { id: 1, name: 'Windows' }, { id: 2, name: 'Mac' }, { id: 4, name: 'Linux' },
  { id: 2048, name: 'Steam Deck Verified' }, { id: 4096, name: 'Steam Deck Playable' }
]

const SUBSCRIPTIONS = [
  { id: 108819, name: 'EA Play' }, { id: 432092, name: 'Game Pass Essential' }, 
  { id: 116734, name: 'Game Pass Ultimate' }, { id: 108665, name: 'PC Game Pass' },
  { id: 323424, name: 'Ubisoft+ Premium PC' }
]

const STEAM_REVIEWS = [
  { id: 9, name: 'Overwhelmingly Positive' }, { id: 8, name: 'Very Positive' },
  { id: 7, name: 'Positive' }, { id: 6, name: 'Mostly Positive' }, { id: 5, name: 'Mixed' }
]

export default function Dashboard({ userId, initialConfig }) {
  const [config, setConfig] = useState(initialConfig || {
    userId: userId,
    title: '',
    minRating: 0,
    maxRating: 10,
    minPrice: 0,
    maxPrice: 100,
    minDiscount: 0,
    maxDiscount: 100,
    onlyHistoricalLow: false,
    dealsDate: '',
    releaseDate: '',
    stores: STORES.map(s => s.id).join(','),
    drms: DRMS.map(d => d.id).join(','),
    platforms: '1',
    subscriptions: '',
    minMetascore: 0,
    maxMetascore: 100,
    steamReviews: '',
    minHltbCompletionMain: 0,
    maxHltbCompletionMain: 200
  })
  
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      await axios.post(`${BASE_URL}/api/config`, config)
      alert('Alert configuration saved successfully!')
    } catch (e) {
      alert('Error saving config: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const parseCSV = (str) => (str ? str.split(',').map(Number) : [])
  const setCSV = (key, arr) => setConfig({ ...config, [key]: arr.join(',') })

  return (
    <div style={styles.container}>
      <div style={styles.mainGrid}>
        
        {/* Sidebar Controls */}
        <div style={styles.sidebar}>
          <FilterGroup title="Price & Discount" icon={Percent}>
            <RangeInput 
              label="Max Price" min={0} max={300} prefix="R$ " 
              value={config.maxPrice} onChange={(v) => setConfig({...config, maxPrice: v})} 
            />
            <RangeInput 
              label="Min Discount" min={0} max={100} suffix="%" 
              value={config.minDiscount} onChange={(v) => setConfig({...config, minDiscount: v})} 
            />
            <div style={styles.toggleRow} onClick={() => setConfig({...config, onlyHistoricalLow: !config.onlyHistoricalLow})}>
              <div style={styles.toggleLabel}>Only Historical Lows</div>
              <div style={{...styles.toggleSwitch, background: config.onlyHistoricalLow ? '#fff' : '#1a1a1a'}}>
                <div style={{...styles.toggleThumb, background: config.onlyHistoricalLow ? '#000' : '#888', transform: config.onlyHistoricalLow ? 'translateX(16px)' : 'translateX(0px)'}}/>
              </div>
            </div>
            <div style={styles.inputGroup}>
               <label style={styles.inputLabel}>Title Search</label>
               <input type="text" style={styles.textInput} placeholder="Leave empty for all" value={config.title} onChange={(e) => setConfig({...config, title: e.target.value})} />
            </div>
          </FilterGroup>

          <FilterGroup title="Ratings & Metascore" icon={Award}>
            <RangeInput 
              label="Deal Rating" min={0} max={10} suffix="/10" 
              value={config.minRating} onChange={(v) => setConfig({...config, minRating: v})} 
            />
            <RangeInput 
              label="Min Metascore" min={0} max={100} suffix="%" 
              value={config.minMetascore} onChange={(v) => setConfig({...config, minMetascore: v})} 
            />
          </FilterGroup>

          <FilterGroup title="Time Constraints" icon={Clock}>
            <div style={styles.inputGroup}>
               <label style={styles.inputLabel}>Deal Started</label>
               <select style={styles.selectInput} value={config.dealsDate} onChange={(e) => setConfig({...config, dealsDate: e.target.value})}>
                 <option value="">Any Time</option>
                 <option value="last24h">Last 24 Hours</option>
                 <option value="last48h">Last 48 Hours</option>
                 <option value="lastWeek">Last Week</option>
               </select>
            </div>
            <div style={styles.inputGroup}>
               <label style={styles.inputLabel}>Max HLTB (Main Story)</label>
               <input type="number" style={styles.selectInput} value={config.maxHltbCompletionMain} onChange={(e) => setConfig({...config, maxHltbCompletionMain: e.target.value})} />
            </div>
          </FilterGroup>

          <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
            {saving ? 'Saving...' : <><Save size={18}/> Save Alert Policy</>}
          </button>
        </div>

        {/* Dynamic Grids */}
        <div style={styles.content}>
          <div style={styles.contentGrid}>
            <FilterGroup title="Target Stores" icon={ShoppingCart}>
              <CheckboxGroup 
                items={STORES} 
                selectedItems={parseCSV(config.stores)}
                onChange={(arr) => setCSV('stores', arr)}
              />
            </FilterGroup>

            <FilterGroup title="Platforms & Subs" icon={Gamepad2}>
              <h5 style={styles.miniHeader}>Platforms</h5>
              <CheckboxGroup 
                items={PLATFORMS} 
                selectedItems={parseCSV(config.platforms)}
                onChange={(arr) => setCSV('platforms', arr)}
              />
              <div style={{height: '15px'}}></div>
              <h5 style={styles.miniHeader}>Subscriptions</h5>
              <CheckboxGroup 
                items={SUBSCRIPTIONS} 
                selectedItems={parseCSV(config.subscriptions)}
                onChange={(arr) => setCSV('subscriptions', arr)}
              />
            </FilterGroup>

            <FilterGroup title="DRM & Steam Reviews" icon={Shield}>
              <h5 style={styles.miniHeader}>Preferred DRM</h5>
              <CheckboxGroup 
                items={DRMS} 
                selectedItems={parseCSV(config.drms)}
                onChange={(arr) => setCSV('drms', arr)}
              />
              <div style={{height: '15px'}}></div>
              <h5 style={styles.miniHeader}>Steam Review Score</h5>
              <CheckboxGroup 
                items={STEAM_REVIEWS} 
                selectedItems={parseCSV(config.steamReviews)}
                onChange={(arr) => setCSV('steamReviews', arr)}
              />
            </FilterGroup>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { width: '100%', maxWidth: '1400px', margin: '0 auto' },
  mainGrid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
  content: { display: 'flex', flexDirection: 'column', gap: '20px' },
  contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' },
  toggleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', cursor: 'pointer' },
  toggleLabel: { fontSize: '11px', fontWeight: '800', color: '#888', textTransform: 'uppercase' },
  toggleSwitch: { width: '36px', height: '20px', borderRadius: '2px', position: 'relative', transition: '0.2s' },
  toggleThumb: { width: '16px', height: '16px', background: '#000', position: 'absolute', top: '2px', left: '2px', transition: '0.2s' },
  inputGroup: { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { fontSize: '11px', fontWeight: '800', color: '#888', textTransform: 'uppercase' },
  textInput: { background: 'transparent', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '2px', fontSize: '14px', outline: 'none' },
  selectInput: { background: '#000', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '2px', fontSize: '14px', outline: 'none' },
  miniHeader: { fontSize: '12px', color: '#fff', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' },
  saveBtn: {
    background: '#fff', color: '#000', padding: '16px', borderRadius: '2px',
    border: 'none', fontWeight: '900', fontSize: '15px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
    textTransform: 'uppercase', marginTop: '10px', letterSpacing: '1px'
  }
}
