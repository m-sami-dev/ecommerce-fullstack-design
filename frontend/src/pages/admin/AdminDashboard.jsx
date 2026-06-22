import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/products/', { params: { page_size: 100 } })
      setProducts(data.results || data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeletingId(slug)
    try {
      await api.delete(`/products/${slug}/`)
      setProducts((prev) => prev.filter((p) => p.slug !== slug))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Admin · Products</h1>
        <Link to="/admin/products/new" className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600">
          + Add product
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No products yet.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={p.image} className="h-10 w-10 rounded-lg object-cover bg-gray-50" alt="" />
                    <span className="font-medium text-gray-800">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.stock}</td>
                  <td className="px-4 py-3">{p.is_featured ? '✓' : ''}</td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <Link to={`/admin/products/${p.slug}/edit`} className="text-brand-600 hover:underline">Edit</Link>
                    <button
                      onClick={() => handleDelete(p.slug)}
                      disabled={deletingId === p.slug}
                      className="text-red-500 hover:underline disabled:opacity-50"
                    >
                      {deletingId === p.slug ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
