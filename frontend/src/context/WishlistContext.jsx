import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [wishlistIds, setWishlistIds] = useState(new Set())

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set())
      return
    }
    const { data } = await api.get('/wishlist/')
    const results = data.results || data
    setWishlistIds(new Set(results.map((item) => item.product.id)))
  }, [isAuthenticated])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const toggleWishlist = useCallback(async (productId) => {
    const { data } = await api.post('/wishlist/toggle/', { product_id: productId })
    setWishlistIds((prev) => {
      const next = new Set(prev)
      if (data.wishlisted) next.add(productId)
      else next.delete(productId)
      return next
    })
    return data.wishlisted
  }, [])

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}