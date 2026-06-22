import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaCheckCircle, FaGlobeAmericas, FaHeart, FaRegHeart, FaCheck } from 'react-icons/fa'
import api from '../api/axios'
import StarRating from '../components/StarRating'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const TABS = ['Description', 'Reviews', 'Shipping', 'About seller']

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const { wishlistIds, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [youMayLike, setYouMayLike] = useState([])
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
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await addToCart(product.id, quantity)
      setAdded(true)
    } finally {
      setAdding(false)
    }
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    await toggleWishlist(product.id)
  }

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    setInquiryError('')
    if (!isAuthenticated) {
      setInquiryError('Please log in to send an inquiry.')
      return
    }
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
      setInquiryError('Could not send your inquiry. Please try again.')
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-500">Loading...</div>
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-500">Product not found.</div>
  }

  const isWishlisted = wishlistIds.has(product.id)
  const supplier = product.supplier_detail

  const specsList = [
    ['Type', product.category_name],
    ['Material', product.material],
    ['Design', product.design],
    ['Customization', product.customization],
    ['Protection', product.protection_policy],
    ['Warranty', product.warranty],
  ].filter(([, value]) => value)

  const tableSpecs = [
    ['Model', product.model_number],
    ['Style', product.style],
    ['Certificate', product.certificate],
    ['Size', product.size_spec],
    ['Memory', product.memory_spec],
  ].filter(([, value]) => value && value !== '-')

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <p className="text-sm text-gray-400 mb-4">
        <Link to="/" className="hover:text-brand-600">Home</Link> /{' '}
        <Link to="/products" className="hover:text-brand-600">Shop</Link> /{' '}
        <Link to={`/products?category=${product.category_slug}`} className="hover:text-brand-600">{product.category_name}</Link>
      </p>

      <div className="grid md:grid-cols-[1fr_1.3fr_280px] gap-6">
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {!product.in_stock ? (
            <span className="text-red-500 text-sm font-medium mb-2 block">Out of stock</span>
          ) : (
            <span className="text-emerald-600 text-sm font-medium mb-2 block">✓ In stock ({product.stock} available)</span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-400">· {product.reviews_count} reviews · {product.sold_count} sold</span>
          </div>

          {product.price_tiers?.length > 0 && (
            <div className="grid grid-cols-3 gap-2 bg-orange-50 rounded-lg p-3 mb-3">
              {product.price_tiers.map((tier) => (
                <div key={tier.id}>
                  <p className="text-base font-bold text-orange-600">${Number(tier.price).toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {tier.min_qty}{tier.max_qty ? `-${tier.max_qty}` : '+'} pcs
                  </p>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500 mb-4">Price: <span className="font-medium text-gray-700">Negotiable</span></p>

          <div className="space-y-2 mb-4">
            {specsList.map(([label, value]) => (
              <div key={label} className="flex text-sm border-b border-gray-50 pb-2">
                <span className="w-32 text-gray-400">{label}</span>
                <span className="text-gray-700">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-600">Quantity</label>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-1.5 text-gray-600 hover:text-brand-600">−</button>
              <span className="px-4 text-sm">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-3 py-1.5 text-gray-600 hover:text-brand-600">+</button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || adding}
            className="w-full sm:w-auto bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 disabled:opacity-50"
          >
            {adding ? 'Adding...' : added ? 'Added to cart ✓' : 'Add to cart'}
          </button>
          {added && (
            <Link to="/cart" className="block text-sm text-brand-600 hover:underline mt-2">
              View cart →
            </Link>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {supplier ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 font-bold flex items-center justify-center">
                    {supplier.avatar_letter || supplier.name[0]}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Supplier</p>
                    <p className="font-semibold text-gray-800 text-sm">{supplier.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {supplier.country_flag_emoji} {supplier.city}, {supplier.country}
                </p>
                {supplier.is_verified && (
                  <p className="text-sm text-emerald-600 flex items-center gap-1.5 mb-1.5">
                    <FaCheckCircle size={13} /> Verified Seller
                  </p>
                )}
                {supplier.worldwide_shipping && (
                  <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-3">
                    <FaGlobeAmericas size={13} /> Worldwide shipping
                  </p>
                )}
                <button
                  onClick={() => setShowInquiry((v) => !v)}
                  className="w-full bg-brand-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 mb-2"
                >
                  Send inquiry
                </button>
                <Link
                  to={`/products?supplier=${supplier.id}`}
                  className="block w-full text-center border border-gray-200 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Seller's profile
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-400">No supplier listed for this product.</p>
            )}
            <button
              onClick={handleWishlistToggle}
              className="w-full flex items-center justify-center gap-2 text-sm text-brand-600 mt-3 hover:underline"
            >
              {isWishlisted ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
              {isWishlisted ? 'Saved' : 'Save for later'}
            </button>
          </div>

          {showInquiry && (
            <form onSubmit={handleInquirySubmit} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <h4 className="text-sm font-semibold text-gray-800">Send an inquiry</h4>
              {inquirySent && <p className="text-xs text-emerald-600">Sent! The supplier will get back to you.</p>}
              {inquiryError && <p className="text-xs text-red-500">{inquiryError}</p>}
              <textarea
                required
                value={inquiry.message}
                onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                placeholder="What would you like to ask?"
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
              <button className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
                Submit inquiry
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex gap-6 border-b border-gray-100 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 ${activeTab === tab ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Description' && (
            <div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>
              {tableSpecs.length > 0 && (
                <table className="w-full text-sm mb-4">
                  <tbody>
                    {tableSpecs.map(([label, value]) => (
                      <tr key={label} className="border-b border-gray-50">
                        <td className="py-2 text-gray-400 w-32">{label}</td>
                        <td className="py-2 text-gray-700">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {product.features?.length > 0 && (
                <ul className="space-y-1.5">
                  {product.features.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <FaCheck size={11} className="text-emerald-500" /> {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="text-sm text-gray-600">
              <p className="mb-2 flex items-center gap-2">
                <StarRating rating={product.rating} reviews={product.reviews_count} /> based on {product.reviews_count} reviews.
              </p>
              <p className="text-gray-400">Detailed individual reviews are coming soon.</p>
            </div>
          )}

          {activeTab === 'Shipping' && (
            <div className="text-sm text-gray-600 space-y-2">
              <p>{supplier?.worldwide_shipping ? 'This supplier ships worldwide.' : 'This supplier currently ships domestically only.'}</p>
              <p>Estimated delivery: 7–14 business days depending on destination and order quantity.</p>
            </div>
          )}

          {activeTab === 'About seller' && (
            <div className="text-sm text-gray-600 space-y-2">
              {supplier ? (
                <>
                  <p className="font-medium text-gray-800">{supplier.name}</p>
                  <p>{supplier.country_flag_emoji} {supplier.city}, {supplier.country}</p>
                  <p>{supplier.is_verified ? 'Verified seller' : 'Not yet verified'}</p>
                </>
              ) : (
                <p>No supplier information available.</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">You may like</h4>
          <div className="space-y-3">
            {youMayLike.map((p) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="flex gap-3 items-center hover:bg-gray-50 rounded-lg p-1.5">
                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover bg-gray-50" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-2">{p.name}</p>
                  <p className="text-xs font-semibold text-gray-900">${Number(p.price).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Related products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}