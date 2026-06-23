import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FaCheckCircle, FaGlobeAmericas, FaHeart, FaRegHeart,
  FaCheck, FaStar, FaStarHalfAlt, FaRegStar, FaChevronLeft, FaChevronRight
} from 'react-icons/fa'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const TABS = ['Description', 'Reviews', 'Shipping', 'About seller']

// Orange stars
function Stars({ rating = 0, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        if (rating >= i + 1) return <FaStar key={i} size={size} className="text-orange-400" />
        if (rating >= i + 0.5) return <FaStarHalfAlt key={i} size={size} className="text-orange-400" />
        return <FaRegStar key={i} size={size} className="text-orange-200" />
      })}
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { wishlistIds, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [youMayLike, setYouMayLike] = useState([])
  const [activeImg, setActiveImg] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeTab, setActiveTab] = useState('Description')
  const [showInquiry, setShowInquiry] = useState(false)
  const [inquiry, setInquiry] = useState({ message: '', quantity: '', unit: 'Pcs' })
  const [inquirySent, setInquirySent] = useState(false)
  const [inquiryError, setInquiryError] = useState('')

  useEffect(() => {
    setLoading(true)
    setAdded(false)
    setActiveTab('Description')
    setActiveImg(0)
    setInquirySent(false)
    setShowInquiry(false)
    api.get(`/products/${slug}/`).then((res) => {
      const data = res.data
      setProduct(data)
      setQuantity(data.min_order_qty || 1)
      if (data.category_slug) {
        api.get('/products/', { params: { category: data.category_slug, page_size: 7 } }).then((r) => {
          setRelated((r.data.results || []).filter((p) => p.slug !== slug).slice(0, 6))
        })
      }
      api.get('/products/', { params: { ordering: '-rating', page_size: 6 } }).then((r) => {
        setYouMayLike((r.data.results || []).filter((p) => p.slug !== slug).slice(0, 5))
      })
    }).finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    setAdding(true)
    try { await addToCart(product.id, quantity); setAdded(true) }
    finally { setAdding(false) }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    await toggleWishlist(product.id)
  }

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    setInquiryError('')
    if (!isAuthenticated) { setInquiryError('Please log in to send an inquiry.'); return }
    try {
      await api.post('/inquiries/', {
        product: product.id,
        message: inquiry.message,
        quantity: inquiry.quantity || null,
        unit: inquiry.unit,
      })
      setInquirySent(true)
      setInquiry({ message: '', quantity: '', unit: 'Pcs' })
    } catch {
      setInquiryError('Could not send inquiry. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-[340px_1fr_280px] gap-6 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-xl" />
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <div className="h-5 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="h-10 bg-gray-100 rounded" />
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <Link to="/products" className="text-brand-600 hover:underline text-sm">← Back to products</Link>
      </div>
    )
  }

  const isWishlisted = wishlistIds.has(product.id)
  const supplier = product.supplier_detail

  // Thumbnails: use gallery images if available, else repeat main image
  const thumbnails = product.gallery?.length > 0
    ? product.gallery.map((g) => g.image)
    : Array(6).fill(product.image)

  const specsList = [
    ['Type', product.category_name],
    ['Material', product.material],
    ['Design', product.design],
    ['Customization', product.customization],
    ['Protection', product.protection_policy],
    ['Warranty', product.warranty],
  ].filter(([, v]) => v)

  const tableSpecs = [
    ['Model', product.model_number],
    ['Style', product.style],
    ['Certificate', product.certificate],
    ['Size', product.size_spec],
    ['Memory', product.memory_spec],
  ].filter(([, v]) => v && v !== '-')

  // Price tiers (fallback demo if backend has none)
  const tiers = product.price_tiers?.length > 0
    ? product.price_tiers
    : [
        { id: 1, price: product.price, min_qty: 50,  max_qty: 100 },
        { id: 2, price: (product.price * 0.92).toFixed(2), min_qty: 100, max_qty: 700 },
        { id: 3, price: (product.price * 0.80).toFixed(2), min_qty: 700, max_qty: null },
      ]

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-brand-600">Clothings</Link>
          <span>›</span>
          <Link to={`/products?category=${product.category_slug}`} className="hover:text-brand-600">
            {product.category_name}
          </Link>
          <span>›</span>
          <span className="text-gray-600 line-clamp-1">{product.name}</span>
        </nav>

        {/* ── MAIN PRODUCT SECTION ── */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
          <div className="grid md:grid-cols-[300px_1fr_260px] gap-6">

            {/* ── LEFT: Image + Thumbnails ── */}
            <div className="flex flex-col gap-3">
              {/* Main image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <img
                  src={thumbnails[activeImg] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Prev/Next on image */}
                {thumbnails.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((i) => (i - 1 + thumbnails.length) % thumbnails.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                    >
                      <FaChevronLeft size={10} />
                    </button>
                    <button
                      onClick={() => setActiveImg((i) => (i + 1) % thumbnails.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                    >
                      <FaChevronRight size={10} />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnail strip — Figma shows 6 small squares */}
              <div className="flex gap-2 flex-wrap">
                {thumbnails.slice(0, 6).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-12 w-12 rounded-lg overflow-hidden border-2 transition-colors
                      ${activeImg === i ? 'border-brand-500' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* ── CENTER: Product Info ── */}
            <div className="flex flex-col gap-3">
              {/* Stock status */}
              {product.in_stock
                ? <span className="text-emerald-600 text-sm font-medium flex items-center gap-1.5"><FaCheckCircle size={13} /> In stock</span>
                : <span className="text-red-500 text-sm font-medium">Out of stock</span>
              }

              {/* Title */}
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>

              {/* Rating row — Figma: stars + number + reviews + sold */}
              <div className="flex items-center gap-2 flex-wrap">
                <Stars rating={Number(product.rating)} />
                <span className="text-sm font-semibold text-gray-700">{Number(product.rating).toFixed(1)}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{product.reviews_count ?? 32} reviews</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{product.sold_count ?? 154} sold</span>
              </div>

              {/* ── TIERED PRICING TABLE — exact Figma orange style ── */}
              <div className="grid grid-cols-3 rounded-lg overflow-hidden border border-orange-100">
                {tiers.map((tier, i) => (
                  <div
                    key={tier.id}
                    className={`p-3 text-center ${i < tiers.length - 1 ? 'border-r border-orange-100' : ''} bg-orange-50`}
                  >
                    <p className="text-base font-bold text-orange-500">${Number(tier.price).toFixed(2)}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {tier.min_qty}{tier.max_qty ? `-${tier.max_qty}` : '+'} pcs
                    </p>
                  </div>
                ))}
              </div>

              {/* Specs list — label : value */}
              <div className="space-y-2">
                {[
                  ['Price', 'Negotiable'],
                  ...specsList,
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-2 text-sm border-b border-gray-50 pb-2">
                    <span className="w-28 shrink-0 text-gray-400">{label}:</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors font-bold"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-medium border-x border-gray-200 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || adding}
                  className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {adding ? 'Adding...' : added ? '✓ Added to cart' : 'Add to cart'}
                </button>
                {added && (
                  <Link to="/cart" className="text-sm text-brand-600 hover:underline">
                    View cart →
                  </Link>
                )}
              </div>
            </div>

            {/* ── RIGHT: Supplier Card ── */}
            <div className="flex flex-col gap-3">
              <div className="border border-gray-100 rounded-xl p-4">
                {supplier ? (
                  <>
                    {/* Supplier header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-11 w-11 rounded-lg bg-teal-100 text-teal-700 font-bold text-lg flex items-center justify-center shrink-0">
                        {supplier.avatar_letter || supplier.name?.[0] || 'S'}
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">Supplier</p>
                        <p className="text-sm font-semibold text-gray-800">{supplier.name}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="text-lg">{supplier.country_flag_emoji || '🇩🇪'}</span>
                      <span>{supplier.city || 'Berlin'}, {supplier.country || 'Germany'}</span>
                    </div>

                    {/* Verified badge */}
                    {supplier.is_verified !== false && (
                      <div className="flex items-center gap-1.5 text-sm text-emerald-600 mb-1.5">
                        <FaCheckCircle size={12} />
                        <span>Verified Seller</span>
                      </div>
                    )}

                    {/* Worldwide shipping */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                      <FaGlobeAmericas size={12} />
                      <span>Worldwide shipping</span>
                    </div>

                    {/* CTA buttons */}
                    <button
                      onClick={() => setShowInquiry((v) => !v)}
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors mb-2"
                    >
                      Send inquiry
                    </button>
                    <Link
                      to={`/products?supplier=${supplier.id}`}
                      className="block w-full text-center border border-brand-200 text-brand-600 hover:bg-brand-50 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      Seller's profile
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No supplier info available.</p>
                )}

                {/* Save for later */}
                <button
                  onClick={handleWishlistToggle}
                  className="w-full flex items-center justify-center gap-2 text-sm text-brand-600 mt-3 hover:underline"
                >
                  {isWishlisted ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
                  {isWishlisted ? 'Saved' : 'Save for later'}
                </button>
              </div>

              {/* Inquiry form (collapsible) */}
              {showInquiry && (
                <form
                  onSubmit={handleInquirySubmit}
                  className="border border-gray-100 rounded-xl p-4 space-y-3"
                >
                  <h4 className="text-sm font-semibold text-gray-800">Send an inquiry</h4>
                  {inquirySent && <p className="text-xs text-emerald-600">✅ Sent successfully!</p>}
                  {inquiryError && <p className="text-xs text-red-500">{inquiryError}</p>}
                  <textarea
                    required
                    value={inquiry.message}
                    onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                    placeholder="What would you like to ask?"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={inquiry.quantity}
                      onChange={(e) => setInquiry({ ...inquiry, quantity: e.target.value })}
                      placeholder="Qty"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                    <select
                      value={inquiry.unit}
                      onChange={(e) => setInquiry({ ...inquiry, unit: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                    >
                      <option>Pcs</option><option>Boxes</option><option>Sets</option>
                    </select>
                  </div>
                  <button className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
                    Submit inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── TABS + YOU MAY LIKE ── */}
        <div className="grid md:grid-cols-[1fr_260px] gap-5 mb-5">

          {/* Tabs section */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100 px-5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3.5 px-4 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {activeTab === 'Description' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

                  {/* Specs table */}
                  {tableSpecs.length > 0 && (
                    <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
                      <tbody>
                        {tableSpecs.map(([label, value], i) => (
                          <tr key={label} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-2.5 px-4 text-gray-400 w-36">{label}</td>
                            <td className="py-2.5 px-4 text-gray-700">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Feature checkmarks */}
                  {product.features?.length > 0 && (
                    <ul className="space-y-2">
                      {product.features.map((f) => (
                        <li key={f.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCheck size={11} className="text-emerald-500 shrink-0" />
                          {f.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'Reviews' && (
                <div className="text-sm text-gray-600 space-y-3">
                  <div className="flex items-center gap-3">
                    <Stars rating={Number(product.rating)} size={16} />
                    <span className="text-2xl font-bold text-gray-900">{Number(product.rating).toFixed(1)}</span>
                    <span className="text-gray-400">based on {product.reviews_count ?? 0} reviews</span>
                  </div>
                  <p className="text-gray-400 text-xs">Detailed individual reviews coming soon.</p>
                </div>
              )}

              {activeTab === 'Shipping' && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="font-medium text-gray-800">Shipping information</p>
                  <p>{supplier?.worldwide_shipping !== false ? '🌍 This supplier ships worldwide.' : 'Ships domestically only.'}</p>
                  <p>Estimated delivery: <strong>7–14 business days</strong> depending on destination.</p>
                  <p>Bulk orders may qualify for expedited shipping — contact supplier for details.</p>
                </div>
              )}

              {activeTab === 'About seller' && (
                <div className="text-sm text-gray-600 space-y-2">
                  {supplier ? (
                    <>
                      <p className="font-semibold text-gray-800 text-base">{supplier.name}</p>
                      <p>{supplier.country_flag_emoji || '🇩🇪'} {supplier.city || 'Berlin'}, {supplier.country || 'Germany'}</p>
                      <p>{supplier.is_verified !== false ? '✅ Verified seller' : 'Not yet verified'}</p>
                      <p className="text-gray-400 text-xs mt-2">
                        Member since 2020 · Worldwide shipping · Refund policy available
                      </p>
                    </>
                  ) : (
                    <p>No supplier information available.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* You may like — right sidebar */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 self-start">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">You may like</h4>
            <div className="space-y-3">
              {youMayLike.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="flex gap-3 items-center hover:bg-gray-50 rounded-lg p-1.5 group"
                >
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ${Number(p.price).toFixed(2)} – ${(Number(p.price) * 1.3).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <section className="mb-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Related products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* ── SUPER DISCOUNT BANNER — Figma blue banner ── */}
        <div
          className="rounded-xl overflow-hidden flex items-center justify-between px-8 py-6 mb-5"
          style={{ background: 'linear-gradient(120deg, #1565c0 0%, #42a5f5 100%)' }}
        >
          <div>
            <p className="text-white text-lg font-bold">Super discount on more than 100 USD</p>
            <p className="text-blue-100 text-sm mt-1">Have you ever finally just write dummy info</p>
          </div>
          <Link
            to="/products"
            className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            Shop now
          </Link>
        </div>

      </div>
    </div>
  )
}