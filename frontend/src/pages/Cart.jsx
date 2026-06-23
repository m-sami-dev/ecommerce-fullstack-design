import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  FaLock, FaHeadset, FaTruck, FaEllipsisV,
  FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex,
} from 'react-icons/fa'
import { useCart } from '../context/CartContext'

const TAX_RATE = 0.05
const SHIPPING = 10

export default function Cart() {
  const {
    cart, updateQuantity, removeItem, clearCart,
    saveForLater, moveToCart, applyCoupon, removeCoupon, loading,
  } = useCart()

  const [busyId, setBusyId]             = useState(null)
  const [checkingOut, setCheckingOut]   = useState(false)
  const [orderPlaced, setOrderPlaced]   = useState(false)
  const [couponInput, setCouponInput]   = useState('')
  const [couponError, setCouponError]   = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const subtotal     = Number(cart.subtotal || 0)
  const discount     = Number(cart.discount_amount || 0)
  const afterDiscount = Number(cart.total || 0)
  const tax          = +(afterDiscount * TAX_RATE).toFixed(2)
  const grandTotal   = +(afterDiscount + tax + SHIPPING).toFixed(2)

  const run = async (id, fn) => {
    setBusyId(id)
    try { await fn() } finally { setBusyId(null) }
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    setCouponError('')
    setApplyingCoupon(true)
    try {
      await applyCoupon(couponInput.trim())
      setCouponInput('')
    } catch (err) {
      setCouponError(err.response?.data?.detail || 'Invalid coupon code.')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    setTimeout(async () => {
      await clearCart()
      setCheckingOut(false)
      setOrderPlaced(true)
    }, 900)
  }

  // ── Order placed screen
  if (orderPlaced) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h1>
        <p className="text-gray-500 mb-8">This is a demo checkout — no payment was charged.</p>
        <Link
          to="/products"
          className="bg-brand-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-600 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  // ── Empty cart
  if (!loading && cart.items.length === 0 && cart.saved_items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">My cart (0)</h1>
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <p className="text-gray-400 mb-5 text-lg">🛒 Your cart is empty</p>
          <Link
            to="/products"
            className="inline-block bg-brand-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-600 transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Page heading */}
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          My cart ({cart.total_items || 0})
        </h1>

        <div className="grid lg:grid-cols-[1fr_300px] gap-5">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-4">

            {/* Cart items */}
            {cart.items.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {cart.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-4 ${idx < cart.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex gap-3">
                      {/* Product image */}
                      <Link to={`/products/${item.product.slug}`} className="shrink-0">
                        <div className="h-[72px] w-[72px] rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </Link>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/products/${item.product.slug}`}
                            className="text-sm font-semibold text-gray-800 hover:text-brand-600 line-clamp-2 leading-snug"
                          >
                            {item.product.name}
                          </Link>
                          {/* Three-dot menu */}
                          <button className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
                            <FaEllipsisV size={13} />
                          </button>
                        </div>
                        {/* Meta — size, color, seller */}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.product.material && `Size: medium, Color: blue`}
                        </p>
                        {item.product.supplier_detail && (
                          <p className="text-xs text-gray-400">
                            Seller: {item.product.supplier_detail.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity + Price row */}
                    <div className="flex items-center justify-between mt-3">
                      {/* − qty + buttons — Figma exact style */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => run(item.id, () => updateQuantity(item.id, Math.max(1, item.quantity - 1)))}
                          disabled={busyId === item.id}
                          className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-brand-600 text-lg font-medium transition-colors disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="h-8 px-4 flex items-center justify-center text-sm font-medium border-x border-gray-200 min-w-[2.5rem]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => run(item.id, () => updateQuantity(item.id, item.quantity + 1))}
                          disabled={busyId === item.id}
                          className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-brand-600 text-lg font-medium transition-colors disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>

                      {/* Item total price */}
                      <span className="text-sm font-bold text-gray-900">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Action buttons row */}
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => run(item.id, () => removeItem(item.id))}
                        disabled={busyId === item.id}
                        className="text-xs border border-red-200 text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-40"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => run(item.id, () => saveForLater(item.id))}
                        disabled={busyId === item.id}
                        className="text-xs border border-brand-200 text-brand-600 hover:bg-brand-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-40"
                      >
                        Save for later
                      </button>
                    </div>
                  </div>
                ))}

                {/* Footer actions */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <Link
                    to="/products"
                    className="flex items-center gap-2 text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    ← Back to shop
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Remove all
                  </button>
                </div>
              </div>
            )}

            {/* Trust badges — Figma: 3 icons row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <FaLock size={18} className="text-gray-400" />, title: 'Secure payment', sub: 'Have you ever finally just' },
                { icon: <FaHeadset size={18} className="text-gray-400" />, title: 'Customer support', sub: 'Have you ever finally just' },
                { icon: <FaTruck size={18} className="text-gray-400" />, title: 'Free delivery', sub: 'Have you ever finally just' },
              ].map((b) => (
                <div key={b.title} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{b.icon}</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{b.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Saved for later */}
            {cart.saved_items?.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3">Saved for later</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {cart.saved_items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <div className="aspect-square bg-gray-50">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-bold text-gray-900">
                          ${Number(item.product.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 min-h-[2rem]">
                          {item.product.name}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-3">
                          <button
                            onClick={() => run(item.id, () => moveToCart(item.id))}
                            disabled={busyId === item.id}
                            className="w-full text-xs border border-brand-200 text-brand-600 hover:bg-brand-50 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                          >
                            Move to cart
                          </button>
                          <button
                            onClick={() => run(item.id, () => removeItem(item.id))}
                            disabled={busyId === item.id}
                            className="w-full text-xs border border-red-200 text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Super discount banner */}
            <div
              className="rounded-xl overflow-hidden flex items-center justify-between px-6 py-5"
              style={{ background: 'linear-gradient(120deg, #1565c0 0%, #42a5f5 100%)' }}
            >
              <div>
                <p className="text-white font-bold">Super discount on more than 100 USD</p>
                <p className="text-blue-100 text-xs mt-0.5">Have you ever finally just write dummy info</p>
              </div>
              <Link
                to="/products"
                className="bg-orange-400 hover:bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
              >
                Shop now
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN — Order Summary ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">

              {/* Coupon */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Have a coupon?</p>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Add coupon"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                  <button
                    disabled={applyingCoupon || !couponInput}
                    className="bg-gray-900 hover:bg-gray-700 text-white px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
                {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                {cart.coupon_code && (
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-emerald-600">✅ Coupon "{cart.coupon_code}" applied</span>
                    <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500">Remove</button>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span className="font-medium text-gray-800">${SHIPPING.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span className="font-medium text-gray-800">+ ${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount:</span>
                    <span className="font-medium">- ${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Grand total */}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total:</span>
                <span className="text-xl font-extrabold text-gray-900">${grandTotal.toFixed(2)}</span>
              </div>

              {/* Checkout button — green Figma style */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut || cart.items.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {checkingOut
                  ? 'Placing order...'
                  : `Checkout (${cart.total_items || 0} items)`}
              </button>

              {/* Payment icons row — Figma: Amex, Mastercard, PayPal, Visa, Apple Pay */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <FaCcAmex      size={28} className="text-blue-700" />
                <FaCcMastercard size={28} className="text-red-500" />
                <FaCcPaypal    size={28} className="text-blue-500" />
                <FaCcVisa      size={28} className="text-blue-800" />
                <span className="text-[11px] font-semibold border border-gray-300 rounded px-1.5 py-0.5 text-gray-600">
                  🍎 Pay
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}