import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  FaTrash, FaLock, FaHeadset, FaTruck,
  FaCcVisa, FaCcMastercard, FaCcPaypal, FaCcAmex,
} from 'react-icons/fa'
import { useCart } from '../context/CartContext'

const TAX_RATE = 0.05

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, saveForLater, moveToCart, applyCoupon, removeCoupon, loading } = useCart()
  const [busyId, setBusyId] = useState(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const subtotal = Number(cart.subtotal || 0)
  const discount = Number(cart.discount_amount || 0)
  const afterDiscount = Number(cart.total || 0)
  const tax = afterDiscount * TAX_RATE
  const grandTotal = afterDiscount + tax

  const handleQuantityChange = async (itemId, value) => {
    setBusyId(itemId)
    try {
      await updateQuantity(itemId, Number(value))
    } finally {
      setBusyId(null)
    }
  }

  const handleRemove = async (itemId) => {
    setBusyId(itemId)
    try {
      await removeItem(itemId)
    } finally {
      setBusyId(null)
    }
  }

  const handleSaveForLater = async (itemId) => {
    setBusyId(itemId)
    try {
      await saveForLater(itemId)
    } finally {
      setBusyId(null)
    }
  }

  const handleMoveToCart = async (itemId) => {
    setBusyId(itemId)
    try {
      await moveToCart(itemId)
    } finally {
      setBusyId(null)
    }
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

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order placed!</h1>
        <p className="text-gray-500 mb-6">This is a demo checkout — no payment was actually charged.</p>
        <Link to="/products" className="bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600">
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Cart ({cart.total_items || 0})</h1>
        {cart.items.length > 0 && (
          <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-500">
            Remove all
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading your cart...</p>
      ) : cart.items.length === 0 && cart.saved_items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link to="/products" className="bg-brand-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-600">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {cart.items.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <CartRow
                    key={item.id}
                    item={item}
                    busy={busyId === item.id}
                    onQuantityChange={(v) => handleQuantityChange(item.id, v)}
                    onRemove={() => handleRemove(item.id)}
                    secondaryAction={{ label: 'Save for later', onClick: () => handleSaveForLater(item.id) }}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <FaLock className="mx-auto mb-2 text-brand-500" />
                Secure payment
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <FaHeadset className="mx-auto mb-2 text-brand-500" />
                Customer support
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <FaTruck className="mx-auto mb-2 text-brand-500" />
                Free delivery
              </div>
            </div>

            {cart.saved_items.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Saved for later</h2>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                  {cart.saved_items.map((item) => (
                    <CartRow
                      key={item.id}
                      item={item}
                      busy={busyId === item.id}
                      readOnlyQuantity
                      onRemove={() => handleRemove(item.id)}
                      secondaryAction={{ label: 'Move to cart', onClick: () => handleMoveToCart(item.id) }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 h-max space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Have a coupon?</p>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Add coupon"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  disabled={applyingCoupon || !couponInput}
                  className="bg-gray-900 text-white px-4 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
              {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              {cart.coupon_code && (
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-emerald-600">Coupon "{cart.coupon_code}" applied</span>
                  <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500">Remove</button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discount</span><span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span><span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span><span className="text-emerald-600">Free</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span><span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut || cart.items.length === 0}
              className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-60"
            >
              {checkingOut ? 'Placing order...' : 'Checkout'}
            </button>

            <div className="flex items-center justify-center gap-3 text-gray-400 text-xl pt-1">
              <FaCcAmex /> <FaCcMastercard /> <FaCcPaypal /> <FaCcVisa />
              <span className="text-xs font-semibold border border-gray-300 rounded px-1.5 py-0.5">🍎 Pay</span>
            </div>

            <Link to="/products" className="block text-center text-sm text-brand-600 hover:underline">
              ← Back to shop
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function CartRow({ item, busy, onQuantityChange, onRemove, secondaryAction, readOnlyQuantity }) {
  const supplier = item.product.supplier_detail

  return (
    <div className="flex gap-4 p-4">
      <Link to={`/products/${item.product.slug}`} className="shrink-0">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="h-20 w-20 rounded-lg object-cover bg-gray-50"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product.slug}`} className="font-medium text-gray-800 hover:text-brand-600">
          {item.product.name}
        </Link>
        <p className="text-xs text-gray-400 mt-1">
          {item.product.material && <>Material: {item.product.material} · </>}
          {supplier && <>Seller: {supplier.name}</>}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-1">${Number(item.product.price).toFixed(2)}</p>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {readOnlyQuantity ? (
          <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
        ) : (
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
              disabled={busy}
              className="px-2.5 py-1 text-gray-600 hover:text-brand-600"
            >−</button>
            <span className="px-3 text-sm">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={busy}
              className="px-2.5 py-1 text-gray-600 hover:text-brand-600"
            >+</button>
          </div>
        )}
        <div className="flex gap-2 text-xs">
          <button onClick={onRemove} disabled={busy} className="text-red-500 hover:underline flex items-center gap-1">
            <FaTrash size={10} /> Remove
          </button>
          {secondaryAction && (
            <button onClick={secondaryAction.onClick} disabled={busy} className="text-brand-600 hover:underline">
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}