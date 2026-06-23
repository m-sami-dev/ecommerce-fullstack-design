import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes,
  FaCommentDots, FaClipboardList, FaHeart, FaChevronDown,
  FaGlobe, FaFlag
} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/axios'

const NAV_LINKS = [
  { label: 'Hot offers', to: '/products?ordering=-rating' },
  { label: 'Gift boxes', to: '/products?category=gift-boxes' },
  { label: 'Projects', to: '/products?category=projects' },
  { label: 'Menu item', to: '/products' },
]

const SHIP_COUNTRIES = [
  { code: 'de', name: 'Germany' },
  { code: 'us', name: 'United States' },
  { code: 'ae', name: 'UAE' },
  { code: 'gb', name: 'UK' },
  { code: 'au', name: 'Australia' },
]

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [catDropOpen, setCatDropOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [shipOpen, setShipOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(SHIP_COUNTRIES[0])
  const [userDropOpen, setUserDropOpen] = useState(false)
  const catRef = useRef(null)
  const helpRef = useRef(null)
  const langRef = useRef(null)
  const shipRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data.results || res.data))
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatDropOpen(false)
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false)
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false)
      if (shipRef.current && !shipRef.current.contains(e.target)) setShipOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('search', query)
    if (selectedCategory) params.set('category', selectedCategory)
    navigate(`/products?${params.toString()}`)
    setMenuOpen(false)
  }

  const totalItems = cart?.total_items || 0

  return (
    <header className="bg-white sticky top-0 z-30 shadow-sm">

      {/* ── TOP BAR ── */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 h-[64px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
            <div className="h-9 w-9 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-lg">
              B
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">Brand</span>
          </Link>

          {/* Search bar with category dropdown */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl border border-gray-200 rounded-md overflow-hidden">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search"
              className="flex-1 px-4 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {/* Category selector inside search */}
            <div className="relative border-l border-gray-200" ref={catRef}>
              <button
                type="button"
                onClick={() => setCatDropOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 h-full whitespace-nowrap"
              >
                {selectedCategory
                  ? categories.find((c) => c.slug === selectedCategory)?.name || 'All category'
                  : 'All category'}
                <FaChevronDown size={10} className="text-gray-400" />
              </button>
              {catDropOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedCategory(''); setCatDropOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                  >
                    All category
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setSelectedCategory(cat.slug); setCatDropOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Search button */}
            <button
              type="submit"
              className="bg-brand-500 hover:bg-brand-600 text-white px-5 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <FaSearch size={13} />
              Search
            </button>
          </form>

          {/* Right icons — Profile / Message / Orders / My cart */}
          <div className="ml-auto flex items-center gap-5">

            {/* Profile */}
            <div className="hidden md:block relative" ref={userRef}>
              <button
                onClick={() => setUserDropOpen((v) => !v)}
                className="flex flex-col items-center text-gray-600 hover:text-brand-600 gap-0.5"
              >
                <FaUser size={16} />
                <span className="text-[11px]">
                  {isAuthenticated ? user.username : 'Profile'}
                </span>
              </button>
              {userDropOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                  {isAuthenticated ? (
                    <>
                      {user?.is_staff && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setUserDropOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setUserDropOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setUserDropOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Message */}
            <div className="hidden md:flex flex-col items-center text-gray-600 hover:text-brand-600 gap-0.5 cursor-pointer">
              <FaCommentDots size={16} />
              <span className="text-[11px]">Message</span>
            </div>

            {/* Orders */}
            <div className="hidden md:flex flex-col items-center text-gray-600 hover:text-brand-600 gap-0.5 cursor-pointer">
              <FaClipboardList size={16} />
              <span className="text-[11px]">Orders</span>
            </div>

            {/* My Cart */}
            <Link
              to="/cart"
              className="flex flex-col items-center text-gray-700 hover:text-brand-600 gap-0.5 relative"
            >
              <div className="relative">
                <FaShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-[11px] hidden md:inline">My cart</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-gray-600 p-1"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── SECOND ROW — Nav links + Language + Ship to ── */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 h-10 overflow-x-auto">

          {/* All category with hamburger icon */}
          <Link
            to="/products"
            className="shrink-0 flex items-center gap-1.5 text-sm text-gray-700 hover:text-brand-600 font-medium px-3 py-1 rounded hover:bg-gray-50"
          >
            <FaBars size={12} />
            All category
          </Link>

          {/* Divider */}
          <span className="text-gray-200 text-lg shrink-0">|</span>

          {/* Hot offers, Gift boxes, etc. */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="shrink-0 text-sm text-gray-600 hover:text-brand-600 px-3 py-1 rounded hover:bg-gray-50 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}

          {/* Help dropdown */}
          <div className="relative shrink-0" ref={helpRef}>
            <button
              onClick={() => setHelpOpen((v) => !v)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600 px-3 py-1 rounded hover:bg-gray-50"
            >
              Help <FaChevronDown size={9} />
            </button>
            {helpOpen && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Help Center</Link>
                <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Contact us</Link>
                <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Money Refund</Link>
                <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600">Shipping</Link>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* English, USD dropdown */}
          <div className="relative shrink-0 hidden md:block" ref={langRef}>
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 px-2 py-1 rounded hover:bg-gray-50"
            >
              <FaGlobe size={12} />
              English, USD
              <FaChevronDown size={9} />
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50">English, USD</button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50">Arabic, AED</button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50">French, EUR</button>
              </div>
            )}
          </div>

          {/* Ship to */}
          <div className="relative shrink-0 hidden md:block" ref={shipRef}>
            <button
              onClick={() => setShipOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 px-2 py-1 rounded hover:bg-gray-50"
            >
              <img
                src={`https://flagcdn.com/w40/${selectedCountry.code}.png`}
                alt={selectedCountry.name}
                className="h-3.5 w-5 rounded-sm object-cover"
              />
              Ship to
              <FaChevronDown size={9} />
            </button>
            {shipOpen && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1">
                {SHIP_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setSelectedCountry(c); setShipOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-brand-50 flex items-center gap-2 ${selectedCountry.code === c.code ? 'text-brand-600 font-medium' : 'text-gray-700'}`}
                  >
                    <img src={`https://flagcdn.com/w40/${c.code}.png`} alt={c.name} className="h-3.5 w-5 rounded-sm object-cover" />
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 shadow-lg">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex border border-gray-200 rounded-lg overflow-hidden">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-brand-500 text-white px-4">
              <FaSearch size={13} />
            </button>
          </form>

          {/* Mobile nav links */}
          <nav className="space-y-1">
            <Link to="/products" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700 border-b border-gray-50">All category</Link>
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-gray-600 border-b border-gray-50">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile auth */}
          <div className="pt-2 space-y-2">
            {isAuthenticated ? (
              <>
                <p className="text-sm text-gray-700 font-medium">Hi, {user.username} 👋</p>
                {user?.is_staff && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-sm text-brand-600">Admin Panel</Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false) }} className="block text-sm text-red-500">Logout</button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center border border-gray-200 text-sm py-2 rounded-lg text-gray-700">Login</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="flex-1 text-center bg-brand-500 text-white text-sm py-2 rounded-lg">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}