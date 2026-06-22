import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FaTh, FaList, FaFilter } from 'react-icons/fa'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import ProductListItem from '../components/ProductListItem'

const CONDITIONS = [
  { value: '', label: 'Any' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'brand_new', label: 'Brand new' },
  { value: 'old', label: 'Old items' },
]

const RATINGS = [5, 4, 3, 2]

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [features, setFeatures] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [manufacturerOpen, setManufacturerOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const ordering = searchParams.get('ordering') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const condition = searchParams.get('condition') || ''
  const minRating = searchParams.get('min_rating') || ''
  const verifiedOnly = searchParams.get('verified_only') === 'true'
  const selectedBrands = (searchParams.get('brand') || '').split(',').filter(Boolean)
  const selectedFeatures = (searchParams.get('feature') || '').split(',').filter(Boolean)
  const supplierId = searchParams.get('supplier') || ''
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('page_size') || 12)

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data.results || res.data))
    api.get('/brands/').then((res) => setBrands(res.data.results || res.data))
    api.get('/features/').then((res) => setFeatures(res.data.results || res.data))
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (category) params.category = category
      if (search) params.search = search
      if (ordering) params.ordering = ordering
      if (minPrice) params.min_price = minPrice
      if (maxPrice) params.max_price = maxPrice
      if (condition) params.condition = condition
      if (minRating) params.min_rating = minRating
      if (verifiedOnly) params.verified_only = true
      if (selectedBrands.length) params.brand = selectedBrands.join(',')
      if (selectedFeatures.length) params.feature = selectedFeatures.join(',')
      if (supplierId) params.supplier = supplierId
      const { data } = await api.get('/products/', { params })
      setProducts(data.results)
      setCount(data.count)
    } finally {
      setLoading(false)
    }
  }, [category, search, ordering, minPrice, maxPrice, condition, minRating, verifiedOnly, selectedBrands.join(','), selectedFeatures.join(','), supplierId, page, pageSize])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const updateParam = (key, value, resetPage = true) => {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === false || value === null) next.delete(key)
    else next.set(key, value)
    if (resetPage) next.delete('page')
    setSearchParams(next)
  }

  const toggleListParam = (key, current, value) => {
    const set = new Set(current)
    if (set.has(value)) set.delete(value)
    else set.add(value)
    updateParam(key, Array.from(set).join(','))
  }

  const clearAllFilters = () => {
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    if (search) next.set('search', search)
    setSearchParams(next)
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const chips = []
  selectedBrands.forEach((slug) => {
    const b = brands.find((br) => br.slug === slug)
    if (b) chips.push({ key: 'brand', value: slug, label: b.name })
  })
  selectedFeatures.forEach((id) => {
    const f = features.find((ft) => String(ft.id) === id)
    if (f) chips.push({ key: 'feature', value: id, label: f.name })
  })
  if (condition) {
    const c = CONDITIONS.find((c) => c.value === condition)
    chips.push({ key: 'condition', value: condition, label: c?.label || condition })
  }
  if (minRating) chips.push({ key: 'min_rating', value: minRating, label: `${minRating}+ stars` })
  if (verifiedOnly) chips.push({ key: 'verified_only', value: 'true', label: 'Verified only' })
  if (supplierId) chips.push({ key: 'supplier', value: supplierId, label: 'This supplier only' })

  const removeChip = (chip) => {
    if (chip.key === 'brand') toggleListParam('brand', selectedBrands, chip.value)
    else if (chip.key === 'feature') toggleListParam('feature', selectedFeatures, chip.value)
    else updateParam(chip.key, '')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <aside
          className={
            mobileFiltersOpen
              ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-4 space-y-6 md:static md:inset-auto md:z-auto md:bg-transparent md:p-0 md:w-64 md:shrink-0'
              : 'hidden md:block md:w-64 md:shrink-0 space-y-6'
          }
        >
          <div className="flex items-center justify-between md:hidden">
            <h2 className="font-semibold text-gray-800">Filters</h2>
            <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500 text-sm">✕ Close</button>
          </div>

          <FilterBlock title="Category">
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => updateParam('category', '')}
                  className={`hover:text-brand-600 ${!category ? 'text-brand-600 font-medium' : 'text-gray-600'}`}
                >
                  All categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateParam('category', cat.slug)}
                    className={`hover:text-brand-600 ${category === cat.slug ? 'text-brand-600 font-medium' : 'text-gray-600'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </FilterBlock>

          <FilterBlock title="Brands">
            <div className="space-y-2 text-sm">
              {brands.map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.slug)}
                    onChange={() => toggleListParam('brand', selectedBrands, b.slug)}
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </FilterBlock>

          <FilterBlock title="Features">
            <div className="space-y-2 text-sm">
              {features.map((f) => (
                <label key={f.id} className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(String(f.id))}
                    onChange={() => toggleListParam('feature', selectedFeatures, String(f.id))}
                  />
                  {f.name}
                </label>
              ))}
            </div>
          </FilterBlock>

          <FilterBlock title="Price range">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => updateParam('min_price', e.target.value)}
                className="w-1/2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam('max_price', e.target.value)}
                className="w-1/2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
          </FilterBlock>

          <FilterBlock title="Condition">
            <div className="space-y-2 text-sm">
              {CONDITIONS.map((c) => (
                <label key={c.value || 'any'} className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="condition"
                    checked={condition === c.value}
                    onChange={() => updateParam('condition', c.value)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </FilterBlock>

          <FilterBlock title="Ratings">
            <div className="space-y-2 text-sm">
              {RATINGS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minRating === String(r)}
                    onChange={() => updateParam('min_rating', minRating === String(r) ? '' : String(r))}
                  />
                  {'★'.repeat(r)}{'☆'.repeat(5 - r)} & up
                </label>
              ))}
            </div>
          </FilterBlock>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <button
              onClick={() => setManufacturerOpen((v) => !v)}
              className="w-full flex items-center justify-between font-semibold text-gray-800 text-sm"
            >
              Manufacturer
              <span className="text-gray-400">{manufacturerOpen ? '−' : '+'}</span>
            </button>
            {manufacturerOpen && (
              <p className="text-xs text-gray-400 mt-3">No manufacturer filters available yet.</p>
            )}
          </div>

          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="md:hidden w-full bg-brand-500 text-white py-2.5 rounded-lg font-medium"
          >
            Show {count} results
          </button>
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600"
              >
                <FaFilter size={12} /> Filters
              </button>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{count}</span> items found
                {search && <> for "<span className="font-medium">{search}</span>"</>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => updateParam('verified_only', e.target.checked ? 'true' : '')}
                />
                Verified only
              </label>
              <select
                value={ordering}
                onChange={(e) => updateParam('ordering', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">Featured</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Top rated</option>
                <option value="-created_at">Newest</option>
              </select>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 ${view === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-500'}`}
                ><FaTh size={13} /></button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 ${view === 'list' ? 'bg-brand-500 text-white' : 'text-gray-500'}`}
                ><FaList size={13} /></button>
              </div>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {chips.map((chip) => (
                <button
                  key={`${chip.key}-${chip.value}`}
                  onClick={() => removeChip(chip)}
                  className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 hover:border-red-300 hover:text-red-500"
                >
                  {chip.label} <span className="font-bold">✕</span>
                </button>
              ))}
              <button onClick={clearAllFilters} className="text-xs text-brand-600 hover:underline">
                Clear all filter
              </button>
            </div>
          )}

          {loading ? (
            <Skeleton />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500">
              No products match these filters yet.
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-8">
            <select
              value={pageSize}
              onChange={(e) => updateParam('page_size', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="10">Show 10</option>
              <option value="12">Show 12</option>
              <option value="24">Show 24</option>
              <option value="48">Show 48</option>
            </select>

            {totalPages > 1 && (
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam('page', String(i + 1), false)}
                    className={`h-8 w-8 rounded-lg text-sm ${page === i + 1 ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterBlock({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">{title}</h3>
      {children}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}