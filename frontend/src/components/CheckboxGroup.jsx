import { CheckSquare, Square } from 'lucide-react'

export default function CheckboxGroup({ items, selectedItems, onChange, title }) {
  const handleToggle = (id) => {
    if (selectedItems.includes(id)) {
      onChange(selectedItems.filter(i => i !== id))
    } else {
      onChange([...selectedItems, id])
    }
  }

  const selectAll = () => onChange(items.map(i => i.id))
  const selectNone = () => onChange([])

  return (
    <div style={styles.container}>
      {title && (
        <div style={styles.header}>
          <span style={styles.title}>{title}</span>
          <div style={styles.actions}>
            <button onClick={selectAll} style={styles.actionBtn}>All</button>
            <button onClick={selectNone} style={styles.actionBtn}>None</button>
          </div>
        </div>
      )}
      
      <div style={styles.grid}>
        {items.map(item => {
          const isActive = selectedItems.includes(item.id)
          return (
            <div 
              key={item.id} 
              onClick={() => handleToggle(item.id)}
              style={{
                ...styles.item,
                background: isActive ? '#1a1a1a' : '#000',
                borderColor: isActive ? '#fff' : '#1a1a1a',
                color: isActive ? '#fff' : '#888'
              }}
            >
              {isActive ? <CheckSquare size={14} /> : <Square size={14} />}
              <span>{item.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: { width: '100%' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  title: { fontSize: '11px', fontWeight: '800', color: '#888', textTransform: 'uppercase' },
  actions: { display: 'flex', gap: '8px' },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    padding: '2px 4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '6px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    border: '1px solid',
    borderRadius: '2px', // Cantos retos
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.1s'
  }
}
