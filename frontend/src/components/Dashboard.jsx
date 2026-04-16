import { useState } from 'react'
import FilterGroup from './FilterGroup'
import CheckboxGroup from './CheckboxGroup'
import RangeInput from './RangeInput'
import { Save, ShoppingCart, Shield, Monitor, Percent, Clock, Gamepad2, Award } from 'lucide-react'
import axios from 'axios'

const STORES = [
  { id: 1, name: 'Steam', icon: 'https://img.gg.deals/16/f1/274044737e94b5583900d9fda053278b9310_64cr64_Q100.png' },
  { id: 2, name: 'Epic Games Store', icon: 'https://img.gg.deals/cc/f2/485010b7fab28334e6a5da46fda42ac74f5e_64cr64_Q100.png' },
  { id: 3, name: 'GOG.com', icon: 'https://img.gg.deals/52/d7/40872c7cb093c40a1a2495d36c7713b5af31_64cr64_Q100.png' },
  { id: 4, name: 'Humble Store', icon: 'https://img.gg.deals/2d/05/9c4b8e01398ad79dc3b36e46cee1da600064_64cr64_Q100.png' },
  { id: 5, name: 'Battle.net', icon: 'https://img.gg.deals/4e/5c/d7d4c5ca4b875c2c3ddd2de53d0369696864_64cr64_Q100.png' },
  { id: 6, name: 'Ea.com', icon: 'https://img.gg.deals/b6/ab/d2b4525a636eab52d6f8be39dddc62422a70_64cr64_Q100.png' },
  { id: 7, name: 'Rockstar Store', icon: 'https://img.gg.deals/dd/f4/cd58779c81a7bf7f20729a5a800b737da34e_64cr64_Q100.png' },
  { id: 10, name: 'Ubisoft Store', icon: 'https://img.gg.deals/5f/44/5c6d23971a3271f98a4924471be65c8f020d_64cr64_Q100.png' },
  { id: 11, name: 'Microsoft Store', icon: 'https://img.gg.deals/1d/04/124762d9adac2ff670870255a0e83e6f57c3_64cr64_Q100.png' },
  { id: 12, name: 'Deals with Game Pass', icon: 'https://img.gg.deals/1d/04/124762d9adac2ff670870255a0e83e6f57c3_64cr64_Q100.png' },
  { id: 13, name: 'Fanatical', icon: 'https://img.gg.deals/0e/bc/4034cafdfbc1d30a8eb13b29e246d56db61f_64cr64_Q100.png' },
  { id: 14, name: '2Game', icon: 'https://img.gg.deals/c0/53/f00ebb13c82a2ac59046cf7140e04a87d2fc_64cr64_Q100.png' },
  { id: 15, name: 'Gamesplanet UK', icon: 'https://img.gg.deals/3e/6c/2aec5f9d298f658ee9eeaeed3bb447759e2d_64cr64_Q100.png' },
  { id: 16, name: 'Gamesplanet DE', icon: 'https://img.gg.deals/3e/6c/2aec5f9d298f658ee9eeaeed3bb447759e2d_64cr64_Q100.png' },
  { id: 17, name: 'Indie Gala Store', icon: 'https://img.gg.deals/db/a7/dc6f11877a94f9f7b957a2b2276e11dd6f1d_64cr64_Q100.png' },
  { id: 18, name: 'Gamesplanet FR', icon: 'https://img.gg.deals/3e/6c/2aec5f9d298f658ee9eeaeed3bb447759e2d_64cr64_Q100.png' },
  { id: 19, name: 'Green Man Gaming', icon: 'https://img.gg.deals/a5/03/934753f909bde1fe82e3f6829fa5ec68e2fa_64cr64_Q100.png' },
  { id: 20, name: 'Gamesplanet US', icon: 'https://img.gg.deals/3e/6c/2aec5f9d298f658ee9eeaeed3bb447759e2d_64cr64_Q100.png' },
  { id: 21, name: 'Voidu', icon: 'https://img.gg.deals/fc/f1/66c75854900b10e58fbdc840ce1f4a00f8ed_64cr64_Q100.png' },
  { id: 22, name: 'WinGameStore', icon: 'https://img.gg.deals/f7/68/82488a7ab9162b86564ecb6ab8b8c0458ad5_64cr64_Q100.png' },
  { id: 23, name: 'GamersGate', icon: 'https://img.gg.deals/6c/cb/8489c18f92274d7e7dcfc465b1337e5e93c8_64cr64_Q100.png' },
  { id: 24, name: 'Allyouplay', icon: 'https://img.gg.deals/03/42/c4be906c8e796ecde76af9c4956e6d7fd000_64cr64_Q100.png' },
  { id: 25, name: 'Dreamgame', icon: 'https://img.gg.deals/de/39/f5d1bfb27715665d1191f7588978fa1715d4_64cr64_Q100.png' },
  { id: 26, name: 'GAMESLOAD', icon: 'https://img.gg.deals/15/a3/3c2b7b93b9674efbb55f46930a996de51fc7_64cr64_Q100.png' },
  { id: 27, name: 'Nuuvem', icon: 'https://img.gg.deals/79/9d/07f5ea30e8eb0571da1d1351ffa8e7132b51_64cr64_Q100.png' },
  { id: 28, name: 'JoyBuggy', icon: 'https://img.gg.deals/bf/a4/eb994a95aad9c28a775b3742cf39deb947b0_64cr64_Q100.png' },
  { id: 29, name: 'Startselect', icon: 'https://img.gg.deals/b7/00/3683187cb2455ba5874e4c77f5f3b4607bf5_64cr64_Q100.png' },
  { id: 30, name: 'Hype.games', icon: 'https://img.gg.deals/e4/bc/d07b3621f15a05dd1b2b986a9e769321f616_64cr64_Q100.png' },
  { id: 31, name: 'Gamerthor', icon: 'https://img.gg.deals/63/02/88fa1ef6ab7fc466869c2a8823bdda58dc95_64cr64_Q100.png' },
  { id: 32, name: 'Planetplay', icon: 'https://img.gg.deals/e9/06/bd8b3b63d005cc92c18a682eacb68a05332d_64cr64_Q100.png' },
  { id: 33, name: 'GameBillet', icon: 'https://img.gg.deals/61/b0/a1895db2f8f419a0dae8d515c7b8023ff6a8_64cr64_Q100.png' },
  { id: 34, name: 'Gamesporium', icon: 'https://img.gg.deals/a6/9e/938cd208dd210524332ab210cf47907a8afe_64cr64_Q100.png' },
  { id: 35, name: 'Player.land', icon: 'https://img.gg.deals/59/17/657dc5729fa05f6729c8144635967500daaf_64cr64_Q100.png' },
  { id: 36, name: 'Playsum', icon: 'https://img.gg.deals/36/8d/19903d86ad4c87d1d2286bf04282df9ee949_64cr64_Q100.png' },
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
  const [config, setConfig] = useState(() => {
    if (initialConfig) return initialConfig;
    const saved = localStorage.getItem('alert_config');
    return saved ? JSON.parse(saved) : {
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
    };
  })
  
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
      await axios.post(`${BASE_URL}/api/config`, config)
      localStorage.setItem('alert_config', JSON.stringify(config))
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
          <FilterGroup title="Price & Discount" icon={Percent} defaultOpen={true}>
            <RangeInput 
              label="Max Price" min={0} max={300} step={5} prefix="R$ " 
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

          <FilterGroup title="Ratings & Metascore" icon={Award} defaultOpen={false}>
            <RangeInput 
              label="Deal Rating" min={0} max={10} suffix="/10" 
              value={config.minRating} onChange={(v) => setConfig({...config, minRating: v})} 
            />
            <RangeInput 
              label="Min Metascore" min={0} max={100} suffix="%" 
              value={config.minMetascore} onChange={(v) => setConfig({...config, minMetascore: v})} 
            />
          </FilterGroup>

          <FilterGroup title="Time Constraints" icon={Clock} defaultOpen={false}>
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
            <FilterGroup title="Target Stores" icon={ShoppingCart} defaultOpen={false}>
              <CheckboxGroup 
                items={STORES} 
                selectedItems={parseCSV(config.stores)}
                onChange={(arr) => setCSV('stores', arr)}
              />
            </FilterGroup>

            <FilterGroup title="Platforms & Subs" icon={Gamepad2} defaultOpen={false}>
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

            <FilterGroup title="DRM & Steam Reviews" icon={Shield} defaultOpen={false}>
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
