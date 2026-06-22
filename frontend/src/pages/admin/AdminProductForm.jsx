import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'

const emptyForm = {
  name: '', category: '', price: '', old_price: '', description: '',
  image: '', stock: '', rating: '', reviews_count: '', is_featured: false,
}

export default function AdminProductForm() {
  const { slug } = useParams()
  const isEdit = Boolean(slug)
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data.results || res.data))
  }, [])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${slug}/`).then((res) => {
      const p = res.data
      setForm({
        name: p.name, category: p.category || '', price: p.price, old_price: p.old_price || '',
        description: p.description, image: p.image, stock: p.stock, rating: p.rating,
        reviews_count: p.reviews_count, is_featured: p.is_featured,
      })
    }).finally(() => setLoading(false))
  }, [slug, isEdit])

  const handleChange = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [key]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      ...form,
      category: form.category || null,
      old_price: form.old_price || null,
    }
    try {
      if (isEdit) {
        await api.put(`/products/${slug}/`, payload)
      } else {
        await api.post('/products/', payload)
      }
      navigate('/admin')
    } catch (err) {
      const data = err.response?.data
      setError(data ? JSON.stringify(data) : 'Could not save this product.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10 text-gray-500">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit product' : 'Add a new product'}</h1>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4 break-all">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name">
            <input required value={form.name} onChange={handleChange('name')} className="input" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={handleChange('category')} className="input">
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Price">
            <input required type="number" step="0.01" value={form.price} onChange={handleChange('price')} className="input" />
          </Field>
          <Field label="Old price (optional)">
            <input type="number" step="0.01" value={form.old_price} onChange={handleChange('old_price')} className="input" />
          </Field>
          <Field label="Stock">
            <input required type="number" value={form.stock} onChange={handleChange('stock')} className="input" />
          </Field>
          <Field label="Image URL">
            <input value={form.image} onChange={handleChange('image')} className="input" placeholder="https://..." />
          </Field>
          <Field label="Rating (0-5)">
            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange('rating')} className="input" />
          </Field>
          <Field label="Reviews count">
            <input type="number" value={form.reviews_count} onChange={handleChange('reviews_count')} className="input" />
          </Field>
        </div>

        <Field label="Description">
          <textarea rows={4} value={form.description} onChange={handleChange('description')} className="input" />
        </Field>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_featured} onChange={handleChange('is_featured')} />
          Show on homepage as a featured product
        </label>

        <div className="flex gap-3 pt-2">
          <button disabled={saving} className="bg-brand-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-600 disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
          </button>
          <button type="button" onClick={() => navigate('/admin')} className="px-5 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
