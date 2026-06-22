import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const EMPTY_CART = {
  items: [], saved_items: [], subtotal: 0, discount_amount: 0,
  total: 0, total_items: 0, coupon_code: null,
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(EMPTY_CART)
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(EMPTY_CART)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get('/cart/')
      setCart(data)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add/', { product_id: productId, quantity })
    setCart(data)
    return data
  }, [])

  const updateQuantity = useCallback(async (itemId, quantity) => {
    const { data } = await api.patch(`/cart/items/${itemId}/`, { quantity })
    setCart(data)
  }, [])

  const removeItem = useCallback(async (itemId) => {
    const { data } = await api.delete(`/cart/items/${itemId}/remove/`)
    setCart(data)
  }, [])

  const clearCart = useCallback(async () => {
    const { data } = await api.delete('/cart/clear/')
    setCart(data)
  }, [])

  const saveForLater = useCallback(async (itemId) => {
    const { data } = await api.patch(`/cart/items/${itemId}/save/`)
    setCart(data)
  }, [])

  const moveToCart = useCallback(async (itemId) => {
    const { data } = await api.patch(`/cart/items/${itemId}/move-to-cart/`)
    setCart(data)
  }, [])

  const applyCoupon = useCallback(async (code) => {
    const { data } = await api.post('/cart/apply-coupon/', { code })
    setCart(data)
  }, [])

  const removeCoupon = useCallback(async () => {
    const { data } = await api.delete('/cart/remove-coupon/')
    setCart(data)
  }, [])

  return (
    <CartContext.Provider value={{
      cart, loading, addToCart, updateQuantity, removeItem, clearCart,
      saveForLater, moveToCart, applyCoupon, removeCoupon, refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}