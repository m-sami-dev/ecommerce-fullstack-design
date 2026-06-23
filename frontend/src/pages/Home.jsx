import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBoxOpen, FaPalette, FaShippingFast, FaShieldAlt, FaSearch } from 'react-icons/fa'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'

const CATEGORY_ICONS = {
  Electronics: '💻',
  'Mobile Accessory': '📱',
  Clothing: '👕',
  'Home & Outdoor': '🏠',
  'Sports & Outdoor': '🎒',
  Gadgets: '🎮',
  Automobiles: '🚗',
}

const REGIONS = [
  { name: 'Arabic Emirates', code: 'ae', url: 'Shopname.ae' },
  { name: 'Australia', code: 'au', url: 'Shopname.com.au' },
  { name: 'United States', code: 'us', url: 'Shopname.us' },
  { name: 'Russia', code: 'ru', url: 'Shopname.ru' },
  { name: 'Italy', code: 'it', url: 'Shopname.it' },
  { name: 'Denmark', code: 'dk', url: 'Shopname.com.dk' },
  { name: 'France', code: 'fr', url: 'Shopname.com.fr' },
  { name: 'Arabic Emirates', code: 'ae', url: 'Shopname.ae' },
  { name: 'China', code: 'cn', url: 'Shopname.cn' },
  { name: 'Great Britain', code: 'gb', url: 'Shopname.co.uk' },
]

const SERVICES = [
  {
    icon: <FaBoxOpen size={22} />,
    title: 'Source from Industry Hubs',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200&q=80',
  },
  {
    icon: <FaPalette size={22} />,
    title: 'Customize Your Products',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80',
  },
  {
    icon: <FaShippingFast size={22} />,
    title: 'Fast, reliable shipping by ocean or air',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=200&q=80',
  },
  {
    icon: <FaShieldAlt size={22} />,
    title: 'Product monitoring and inspection',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80',
  },
]

// Countdown hook
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
    if (!isAuthenticated) { setInquiryError('Please log in to send an inquiry.'); return }
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
      setInquiryError('Could not send inquiry. Please try again.')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-5 space-y-8">

        {/* ── HERO SECTION ── */}
        <section className="grid md:grid-cols-[220px_1fr_240px] gap-3">

          {/* Left — Category sidebar */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 py-2">
            <ul className="text-sm">
              {categories.slice(0, 9).map((cat, i) => (
                <li key={cat.id}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className={`flex items-center gap-2 px-4 py-2.5 hover:bg-brand-50 hover:text-brand-600 transition-colors
                      ${i === 0 ? 'text-brand-600 font-medium bg-brand-50' : 'text-gray-600'}`}
                  >
                    <span>{CATEGORY_ICONS[cat.name] || '🛍️'}</span>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 text-sm">
                  More category
                </Link>
              </li>
            </ul>
          </div>

          {/* Center — Hero banner (Figma: headphones + laptop image) */}
          <div
            className="relative rounded-xl overflow-hidden flex flex-col justify-center px-8 py-10 min-h-[220px]"
            style={{
              background: 'linear-gradient(135deg, #d4f5f0 0%, #b2ede5 40%, #8fd6cb 100%)',
            }}
          >
            {/* Decorative product image (right side) */}
            <div className="absolute right-0 bottom-0 h-full w-1/2 flex items-end justify-end pointer-events-none select-none">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
                alt="headphones"
                className="h-[85%] w-auto object-contain opacity-90"
              />
            </div>
            {/* Text */}
            <div className="relative z-10 max-w-xs">
              <p className="text-sm font-semibold text-teal-700 mb-1">Latest trending</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                Electronic items
              </h1>
              <Link
                to="/products"
                className="inline-block border border-gray-700 text-gray-800 bg-white/70 hover:bg-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>

          {/* Right — Auth cards */}
          <div className="flex flex-col gap-3">
            {/* Join / Login card */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              {isAuthenticated ? (
                <div>
                  <p className="text-sm font-semibold text-gray-800">Hi, {user.username} 👋</p>
                  <p className="text-xs text-gray-500 mt-1">Welcome back!</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-800 mb-3">Hi, user<br />let's get started</p>
                  <Link
                    to="/signup"
                    className="block text-center bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg text-sm font-medium mb-2 transition-colors"
                  >
                    Join now
                  </Link>
                  <Link
                    to="/login"
                    className="block text-center border border-gray-200 text-gray-700 hover:bg-gray-50 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
            {/* Promo card 1 */}
            <div className="bg-orange-400 rounded-xl p-4 flex flex-col justify-center">
              <p className="text-white text-sm font-semibold leading-snug">
                Get US $10 off<br />with a new<br />supplier
              </p>
            </div>
            {/* Promo card 2 */}
            <div className="bg-teal-500 rounded-xl p-4 flex flex-col justify-center">
              <p className="text-white text-sm font-semibold leading-snug">
                Send quotes with<br />supplier preferences
              </p>
            </div>
          </div>
        </section>

        {/* ── DEALS AND OFFERS ── */}
        <section className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Deals and offers</h2>
              <p className="text-sm text-gray-400">Hygiene equipments</p>
            </div>
            {/* Countdown timer — Figma style gray boxes */}
            <div className="flex gap-2">
              {[['Hour', countdown.hours], ['Min', countdown.mins], ['Sec', countdown.secs]].map(([label, val]) => (
                <div key={label} className="bg-gray-800 text-white rounded-lg w-14 py-2 text-center">
                  <div className="text-base font-bold leading-none">{String(val).padStart(2, '0')}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Deal cards — horizontal scroll on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {deals.length > 0
              ? deals.map((product) => <ProductCard key={product.id} product={product} />)
              : Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            }
          </div>
        </section>

        {/* ── HOME AND OUTDOOR ── */}
        <CategoryShowcase
          title="Home and outdoor"
          subtitle=""
          bgColor="bg-amber-50"
          image="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80"
          products={homeProducts}
          categorySlug="home-outdoor"
        />

        {/* ── CONSUMER ELECTRONICS ── */}
        <CategoryShowcase
          title="Consumer electronics and gadgets"
          subtitle=""
          bgColor="bg-blue-50"
          image="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&q=80"
          products={electronicsProducts}
          categorySlug="electronics"
        />

        {/* ── SEND INQUIRY BANNER ── */}
        <section
          className="rounded-xl overflow-hidden grid md:grid-cols-2 min-h-[200px]"
          style={{
            background: 'linear-gradient(120deg, #1565c0 0%, #42a5f5 100%)',
          }}
        >
          {/* Left text */}
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-white mb-2 max-w-xs">
              An easy way to send requests to all suppliers
            </h2>
            <p className="text-blue-100 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.
            </p>
          </div>
          {/* Right form */}
          <div className="bg-white m-4 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="font-semibold text-gray-800 text-sm">Send quote to suppliers</h3>
            {inquirySent && <p className="text-xs text-emerald-600">✅ Inquiry sent successfully!</p>}
            {inquiryError && <p className="text-xs text-red-500">{inquiryError}</p>}
            <input
              required
              value={inquiry.item_name}
              onChange={(e) => setInquiry({ ...inquiry, item_name: e.target.value })}
              placeholder="What item you need?"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
            <textarea
              value={inquiry.message}
              onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
              placeholder="Type more details"
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 resize-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={inquiry.quantity}
                onChange={(e) => setInquiry({ ...inquiry, quantity: e.target.value })}
                placeholder="Quantity"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
              />
              <select
                value={inquiry.unit}
                onChange={(e) => setInquiry({ ...inquiry, unit: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option>Pcs</option>
                <option>Boxes</option>
                <option>Sets</option>
                <option>Kg</option>
              </select>
            </div>
            <button
              onClick={handleInquirySubmit}
              className="bg-brand-500 hover:bg-brand-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Send inquiry
            </button>
          </div>
        </section>

        {/* ── RECOMMENDED ITEMS ── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended items</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {recommended.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>

        {/* ── EXTRA SERVICES ── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Our extra services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="relative rounded-xl overflow-hidden h-36 cursor-pointer group"
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  <div className="h-9 w-9 rounded-full bg-white/20 text-white flex items-center justify-center">
                    {s.icon}
                  </div>
                  <p className="text-white text-xs font-semibold leading-snug">{s.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SUPPLIERS BY REGION ── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Suppliers by region</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {REGIONS.map((r, i) => (
              <div key={i} className="flex items-center gap-2 group cursor-pointer">
                <img
                  src={`https://flagcdn.com/w40/${r.code}.png`}
                  alt={r.name}
                  className="h-5 w-7 rounded-sm object-cover shrink-0"
                />
                <div>
                  <p className="text-sm text-gray-700 font-medium leading-none">{r.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.url}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="bg-gray-100 rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-base font-bold text-gray-900">Subscribe on our newsletter</h3>
            <p className="text-sm text-gray-500">Get daily news on upcoming offers from many suppliers all over the world</p>
          </div>
          <form className="flex w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
              <span className="flex items-center pl-3 text-gray-400">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="Email"
                className="px-3 py-2.5 text-sm outline-none w-48 sm:w-64"
              />
            </div>
            <button className="ml-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Subscribe
            </button>
          </form>
        </section>

      </div>
    </div>
  )
}

// ── Category Showcase Component ──
function CategoryShowcase({ title, bgColor, image, products, categorySlug }) {
  return (
    <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="grid md:grid-cols-[200px_1fr]">
        {/* Left image panel */}
        <div className={`hidden md:flex flex-col justify-between p-5 ${bgColor}`}>
          <h2 className="text-base font-bold text-gray-900 leading-snug">{title}</h2>
          <div className="flex-1 flex items-center justify-center py-3">
            <img src={image} alt={title} className="h-32 w-full object-cover rounded-lg" />
          </div>
          <Link
            to={`/products?category=${categorySlug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
          >
            Source now →
          </Link>
        </div>

        {/* Right products grid */}
        <div className="p-4">
          {/* Mobile title */}
          <div className="flex items-center justify-between mb-3 md:hidden">
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            <Link to={`/products?category=${categorySlug}`} className="text-sm text-brand-600">See all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {products.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.slug}`}
                className="flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="h-[72px] w-[72px] rounded-xl overflow-hidden bg-gray-50">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs text-gray-700 line-clamp-2 leading-snug">{p.name}</p>
                <p className="text-xs text-gray-500">From USD {Number(p.price).toFixed(0)}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Skeleton Card ──
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  )
}