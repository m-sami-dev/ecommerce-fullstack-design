import { Link, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa'
import StarRating from './StarRating'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)

  const isWishlisted = wishlistIds.has(product.id)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setAdding(true)
    try {
      await addToCart(product.id, 1)
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    await toggleWishlist(product.id)
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.old_price && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
            -{Math.round(100 - (product.price / product.old_price) * 100)}%
          </span>
        )}
        <button
          onClick={handleWishlist}
          title="Save to wishlist"
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 shadow flex items-center justify-center text-brand-500 hover:scale-110 transition-transform"
        >
          {isWishlisted ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
        </button>
        {!product.in_stock && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-semibold text-gray-700">
            Out of stock
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3">
        <p className="text-[11px] uppercase tracking-wide text-brand-500 font-medium">
          {product.category_name || 'General'}
        </p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <StarRating rating={product.rating} />
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
            {product.old_price && (
              <span className="text-xs text-gray-400 line-through">${Number(product.old_price).toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.in_stock || adding}
            title="Add to cart"
            className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-500 hover:text-white transition-colors disabled:opacity-40"
          >
            <FaShoppingCart size={13} />
          </button>
        </div>
      </div>
    </Link>
  )
}