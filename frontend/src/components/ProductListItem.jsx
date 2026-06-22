import { Link, useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import StarRating from './StarRating'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductListItem({ product }) {
  const { isAuthenticated } = useAuth()
  const { wishlistIds, toggleWishlist } = useWishlist()
  const navigate = useNavigate()
  const isWishlisted = wishlistIds.has(product.id)

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
      className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="h-28 w-28 sm:h-32 sm:w-32 shrink-0 rounded-lg bg-gray-50 overflow-hidden">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm sm:text-base font-medium text-gray-800">{product.name}</h3>
          <button onClick={handleWishlist} className="text-brand-500 shrink-0">
            {isWishlisted ? <FaHeart size={15} /> : <FaRegHeart size={15} />}
          </button>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
          {product.old_price && (
            <span className="text-xs text-gray-400 line-through">${Number(product.old_price).toFixed(2)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <StarRating rating={product.rating} />
          <span>· {product.sold_count || 0} orders</span>
          <span className="text-emerald-600">· Free Shipping</span>
        </div>
        <p className="hidden sm:block text-xs text-gray-500 mt-2 line-clamp-2">{product.description}</p>
        <span className="inline-block text-xs font-medium text-brand-600 mt-2 hover:underline">View details</span>
      </div>
    </Link>
  )
}