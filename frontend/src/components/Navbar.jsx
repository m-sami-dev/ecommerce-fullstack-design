import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/axios'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data.results || res.data))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products')
    setMenuOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">B</div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">Brand</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="w-full rounded-l-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <button className="rounded-r-lg bg-brand-500 text-white px-4 flex items-center justify-center hover:bg-brand-600">
              <FaSearch size={14} />
            </button>
          </form>

          <nav className="ml-auto flex items-center gap-5 text-sm">
            <Link to="/products" className="hidden sm:inline text-gray-600 hover:text-brand-600 font-medium">
              Shop
            </Link>
            {user?.is_staff && (
              <Link to="/admin" className="hidden sm:inline text-gray-600 hover:text-brand-600 font-medium">
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="flex items-center gap-1 text-gray-600">
                  <FaUser size={13} /> {user.username}
                </span>
                <button onClick={logout} className="text-gray-500 hover:text-red-500 font-medium">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-brand-600 font-medium">
                <FaUser size={14} /> Login
              </Link>
            )}

            <Link to="/cart" className="relative flex items-center text-gray-700 hover:text-brand-600">
              <FaShoppingCart size={18} />
              {cart.total_items > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center">
                  {cart.total_items}
                </span>
              )}
            </Link>

            <button className="sm:hidden text-gray-600" onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </nav>
        </div>

        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-3 space-y-3">
            <form onSubmit={handleSearch} className="flex">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search products..."
                className="w-full rounded-l-lg border border-gray-200 px-3 py-2 text-sm"
              />
              <button className="rounded-r-lg bg-brand-500 text-white px-3"><FaSearch size={13} /></button>
            </form>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Shop</Link>
            {user?.is_staff && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Admin</Link>
            )}
            {isAuthenticated ? (
              <button onClick={() => { logout(); setMenuOpen(false) }} className="block text-red-500 font-medium">
                Logout ({user.username})
              </button>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-gray-700 font-medium">Login</Link>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 overflow-x-auto">
        <div className="flex gap-2 px-4 py-2 max-w-7xl mx-auto">
          <Link
            to="/products"
            className="shrink-0 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-brand-50 hover:text-brand-600"
          >
            All category
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="shrink-0 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-brand-50 hover:text-brand-600"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}