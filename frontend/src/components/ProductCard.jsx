import { Link, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaHeart, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useState } from 'react'

// Inline star renderer — exact Figma style (orange stars)
function Stars({ rating = 0 }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-orange-400" size={11} />)
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-orange-400" size={11} />)
    } else {
      stars.push(<FaRegStar key={i} className="text-orange-300" size={11} />)
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>
}

export default function ProductCard({ product, listView = false }) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)

  const isWishlisted = wishlistIds.has(product.id)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    setAdding(true)
    try { await addToCart(product.id, 1) } finally { setAdding(false) }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    await toggleWishlist(product.id)
  }

  const discount = product.old_price
    ? Math.round(100 - (product.price / product.old_price) * 100)
    : null

  // ── LIST VIEW (Product Listing page list mode) ──
  if (listView) {
    return (
      <Link
        to={`/products/${product.slug}`}
        className="group flex gap-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden p-3"
      >
        {/* Image */}
        <div className="relative w-[120px] h-[120px] shrink-0 bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discount && (
            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
            {/* Stars + rating number + orders */}
            <div className="flex items-center gap-1.5 mt-1">
              <Stars rating={Number(product.rating)} />
              <span className="text-xs font-semibold text-gray-700">{Number(product.rating).toFixed(1)}</span>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-xs text-gray-500">{product.orders_count ?? 154} orders</span>
            </div>
            {/* Free shipping */}
            {product.free_shipping !== false && (
              <span className="text-xs font-medium text-green-500 mt-1 block">Free Shipping</span>
            )}
            {/* Description snippet */}
            {product.description && (
              <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{product.description}</p>
            )}
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
              {product.old_price && (
                <span className="text-xs text-gray-400 line-through">${Number(product.old_price).toFixed(2)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlist}
                className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-brand-500 hover:border-brand-300 transition-colors"
              >
                {isWishlisted ? <FaHeart size={13} className="text-brand-500" /> : <FaRegHeart size={13} />}
              </button>
              <button
                onClick={handleAdd}
                disabled={!product.in_stock || adding}
                className="text-xs font-medium text-brand-600 border border-brand-200 hover:bg-brand-500 hover:text-white hover:border-brand-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
              >
                {adding ? 'Adding...' : 'View details'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // ── GRID VIEW (default) ──
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Discount badge */}
        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          title="Save to wishlist"
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 shadow flex items-center justify-center hover:scale-110 transition-transform"
        >
          {isWishlisted
            ? <FaHeart size={13} className="text-brand-500" />
            : <FaRegHeart size={13} className="text-gray-400" />}
        </button>
        {/* Out of stock overlay */}
        {!product.in_stock && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-semibold text-gray-600">
            Out of stock
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-1 p-3">
        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          {product.old_price && (
            <span className="text-xs text-gray-400 line-through">${Number(product.old_price).toFixed(2)}</span>
          )}
        </div>

        {/* Product name */}
        <h3 className="text-sm text-gray-700 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        {/* Stars + rating + orders — Figma exact layout */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Stars rating={Number(product.rating)} />
          <span className="text-xs font-semibold text-gray-700">{Number(product.rating).toFixed(1)}</span>
          <span className="text-gray-300 text-xs">•</span>
          <span className="text-xs text-gray-500">{product.orders_count ?? 154} orders</span>
        </div>

        {/* Free Shipping badge */}
        {product.free_shipping !== false && (
          <span className="text-xs font-medium text-green-500">Free Shipping</span>
        )}
      </div>

      {/* Add to cart — bottom */}
      <div className="px-3 pb-3 mt-auto">
        <button
          onClick={handleAdd}
          disabled={!product.in_stock || adding}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white py-2 rounded-lg transition-colors disabled:opacity-40"
        >
          <FaShoppingCart size={12} />
          {adding ? 'Adding...' : 'Add to cart'}
        </button>
      </div>
    </Link>
  )
}