import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'

export default function StarRating({ rating = 0, reviews }) {
  const value = Number(rating) || 0
  const fullStars = Math.floor(value)
  const hasHalf = value - fullStars >= 0.5

  return (
    <div className="flex items-center gap-1 text-xs">
      <div className="flex text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) return <FaStar key={i} />
          if (i === fullStars && hasHalf) return <FaStarHalfAlt key={i} />
          return <FaRegStar key={i} />
        })}
      </div>
      <span className="text-gray-500">{value.toFixed(1)}</span>
      {reviews !== undefined && <span className="text-gray-400">· {reviews} reviews</span>}
    </div>
  )
}
