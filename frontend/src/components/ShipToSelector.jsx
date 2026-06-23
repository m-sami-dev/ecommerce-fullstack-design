import { useState, useRef, useEffect } from 'react'
import { FaChevronDown } from 'react-icons/fa'

const COUNTRIES = [
  { name: 'Germany', code: 'de' },
  { name: 'United States', code: 'us' },
  { name: 'United Arab Emirates', code: 'ae' },
  { name: 'United Kingdom', code: 'gb' },
  { name: 'Australia', code: 'au' },
  { name: 'France', code: 'fr' },
  { name: 'Italy', code: 'it' },
  { name: 'China', code: 'cn' },
]

export default function ShipToSelector() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(COUNTRIES[0])
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600"
      >
        <span className="text-gray-400">Ship to</span>
        <img
          src={`https://flagcdn.com/w40/${selected.code}.png`}
          alt={selected.name}
          className="h-3.5 w-5 rounded-sm object-cover"
        />
        <FaChevronDown size={9} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setSelected(c); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 ${selected.code === c.code ? 'text-brand-600 font-medium' : 'text-gray-600'}`}
            >
              <img src={`https://flagcdn.com/w40/${c.code}.png`} alt={c.name} className="h-3.5 w-5 rounded-sm object-cover" />
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}