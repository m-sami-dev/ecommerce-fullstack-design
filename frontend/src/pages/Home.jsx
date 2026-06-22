import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBoxOpen, FaPalette, FaShippingFast, FaShieldAlt } from 'react-icons/fa'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'

const CATEGORY_ICONS = {
  Electronics: '💻',
  'Mobile Accessory': '📱',
  Clothing: '👕',
  'Home & Outdoor': '🏠',
  'Sports & Outdoor': '🎒',
}

const REGIONS = [
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Russia', flag: '🇷🇺' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'United Kingdom', flag: '🇬🇧' },
]

const SERVICES = [
  { icon: FaBoxOpen, title: 'Source from Industry Hubs' },
  { icon: FaPalette, title: 'Customize Your Products' },
  { icon: FaShippingFast, title: 'Fast, reliable shipping by ocean or air' },
  { icon: FaShieldAlt, title: 'Product monitoring and inspection' },
]

function useCountdown() {
  const [time, setTime] = useState({ days: 4, hours: 13, mins: 34, secs: 56 })
  useEffect(() => {
    const id = setInterval(() => {
      setTime((prev) => {
        let { days, hours, mins, secs } = prev
        secs -= 1
        if (secs < 0) { secs = 59; mins -= 1 }
        if (mins < 0) { mins = 59; hours -= 1 }
        if (hours < 0) { hours = 23; days -= 1 }
        if (days < 0) return { days: 4, hours: 13, mins: 34, secs: 56 }
        return { days, hours, mins, secs }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function Home() {
  const { user, isAuthenticated } = useAuth()
  const [categories, setCategories] = useState([])
  const [deals, setDeals] = useState([])
  const [homeProducts, setHomeProducts] = useState([])
  const [electronicsProducts, setElectronicsProducts] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)
  const countdown = useCountdown()

  const [inquiry, setInquiry] = useState({ item_name: '', message: '', quantity: '', unit: 'Pcs' })
  const [inquirySent, setInquirySent] = useState(false)
  const [inquiryError, setInquiryError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [catRes, dealsRes, homeRes, elecRes, recRes] = await Promise.all([
          api.get('/categories/'),
          api.get('/products/', { params: { page_size: 20 } }),
          api.get('/products/', { params: { category: 'home-outdoor', ordering: 'price', page_size: 8 } }),
          api.get('/products/', { params: { category: 'electronics', ordering: 'price', page_size: 8 } }),
          api.get('/products/', { params: { ordering: '-created_at', page_size: 10 } }),
        ])
        setCategories(catRes.data.results || catRes.data)
        setDeals((dealsRes.data.results || []).filter((p) => p.old_price).slice(0, 5))
        setHomeProducts(homeRes.data.results || [])
        setElectronicsProducts(elecRes.data.results || [])
        setRecommended(recRes.data.results || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    setInquiryError('')
    if (!isAuthenticated) {
      setInquiryError('Please log in to send an inquiry.')
      return
    }
    try {
      await api.post('/inquiries/', {
        item_name: inquiry.item_name,
        message: inquiry.message,
        quantity: inquiry.quantity || null,
        unit: inquiry.unit,
      })
      setInquirySent(true)
      setInquiry({ item_name: '', message: '', quantity: '', unit: 'Pcs' })
    } catch {
      setInquiryError('Could not send your inquiry. Please try again.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">

      <section className="grid md:grid-cols-[220px_1fr_260px] gap-4">
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 p-3">
          <ul className="space-y-1 text-sm">
            {categories.map((cat, i) => (
              <li key={cat.id}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className={`block px-3 py-2 rounded-lg ${i === 0 ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {CATEGORY_ICONS[cat.name] || '🛍️'} {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-8 flex flex-col justify-center">
          <p className="text-sm font-semibold text-emerald-700 mb-2">Latest trending</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 max-w-md">
            Electronic items, up to 25% off this week
          </h1>
          <Link
            to="/products"
            className="inline-block w-max bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700"
          >
            Learn more
          </Link>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            {isAuthenticated ? (
              <p className="text-sm text-gray-700">Hi, <span className="font-semibold">{user.username}</span> 👋</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-800 mb-3">Hi, let's get started</p>
                <Link to="/signup" className="block text-center bg-brand-500 text-white rounded-lg py-2 text-sm font-medium mb-2 hover:bg-brand-600">
                  Join now
                </Link>
                <Link to="/login" className="block text-center border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Log in
                </Link>
              </>
            )}
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <p className="text-sm font-medium text-orange-700">Get $10 off your first order</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4">
            <p className="text-sm font-medium text-teal-700">Send quotes with your preferences</p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Deals and offers</h2>
            <p className="text-sm text-gray-500">Limited-time discounts, while stock lasts</p>
          </div>
          <div className="flex gap-2">
            {[['Days', countdown.days], ['Hour', countdown.hours], ['Min', countdown.mins], ['Sec', countdown.secs]].map(([label, val]) => (
              <div key={label} className="bg-gray-900 text-white rounded-lg px-3 py-2 text-center min-w-[52px]">
                <div className="text-sm font-bold">{String(val).padStart(2, '0')}</div>
                <div className="text-[10px] text-gray-300">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {deals.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <CategoryShowcase title="Home and outdoor" image="https://picsum.photos/seed/homeoutdoor/400/500" products={homeProducts} categorySlug="home-outdoor" />

      <CategoryShowcase title="Consumer electronics and gadgets" image="https://picsum.photos/seed/electronics/400/500" products={electronicsProducts} categorySlug="electronics" />

      <section className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-8 grid md:grid-cols-2 gap-6 items-center text-white">
        <div>
          <h2 className="text-2xl font-bold mb-2">An easy way to send requests to all suppliers</h2>
          <p className="text-brand-100 text-sm">
            Tell us what you need and our suppliers will reach out with quotes.
          </p>
        </div>
        <form onSubmit={handleInquirySubmit} className="bg-white rounded-xl p-5 space-y-3 text-gray-800">
          <h3 className="font-semibold">Send quote to suppliers</h3>
          {inquirySent && <p className="text-sm text-emerald-600">Thanks! Your inquiry has been sent.</p>}
          {inquiryError && <p className="text-sm text-red-500">{inquiryError}</p>}
          <input
            required
            value={inquiry.item_name}
            onChange={(e) => setInquiry({ ...inquiry, item_name: e.target.value })}
            placeholder="What item you need?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            value={inquiry.message}
            onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
            placeholder="Type more details"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={inquiry.quantity}
              onChange={(e) => setInquiry({ ...inquiry, quantity: e.target.value })}
              placeholder="Quantity"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={inquiry.unit}
              onChange={(e) => setInquiry({ ...inquiry, unit: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option>Pcs</option>
              <option>Boxes</option>
              <option>Sets</option>
            </select>
          </div>
          <button className="w-full bg-brand-500 text-white py-2.5 rounded-lg font-medium hover:bg-brand-600">
            Send inquiry
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended items</h2>
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommended.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Our extra services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SERVICES.map(({ icon: Icon, title }) => (
            <div key={title} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
                <Icon size={16} />
              </div>
              <p className="text-sm text-gray-700">{title}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Suppliers by region</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {REGIONS.map((r) => (
            <div key={r.name} className="flex items-center gap-2 text-sm text-gray-600">
              <span>{r.flag}</span> {r.name}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Subscribe to our newsletter</h3>
          <p className="text-sm text-gray-500">Get daily news on upcoming offers from across the store.</p>
        </div>
        <form className="flex w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Email address"
            className="rounded-l-lg border border-gray-200 px-4 py-2 text-sm flex-1 sm:w-64"
          />
          <button className="rounded-r-lg bg-brand-500 text-white px-4 py-2 text-sm font-medium hover:bg-brand-600">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  )
}

function CategoryShowcase({ title, image, products, categorySlug }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="grid md:grid-cols-[220px_1fr] gap-4">
        <div
          className="hidden md:flex rounded-2xl bg-cover bg-center items-end p-4"
          style={{ backgroundImage: `url(${image})`, minHeight: '220px' }}
        >
          <Link to={`/products?category=${categorySlug}`} className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg">
            Source now →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow"
            >
              <img src={p.image} alt={p.name} className="h-16 w-16 object-cover rounded-lg" />
              <p className="text-xs text-gray-700 line-clamp-2">{p.name}</p>
              <p className="text-xs font-semibold text-brand-600">From ${Number(p.price).toFixed(0)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}