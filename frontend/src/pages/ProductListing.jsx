import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  FaTh, FaList, FaFilter, FaTimes, FaChevronDown,
  FaChevronUp, FaStar, FaChevronLeft, FaChevronRight
} from 'react-icons/fa'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'

const CONDITIONS = [
  { value: '', label: 'Any' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'brand_new', label: 'Brand new' },
  { value: 'old', label: 'Old items' },
]

const RATINGS = [5, 4, 3, 2]

// Collapsible sidebar filter block
function FilterBlock({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-3"
      >
        {title}
        {open ? <FaChevronUp size={10} className="text-gray-400" /> : <FaChevronDown size={10} className="text-gray-400" />}
      </button>
      {open && children}
    </div>
  )
}

// Star rating row for filter
function StarRow({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} size={11} className={i < count ? 'text-orange-400' : 'text-gray-200'} />
      ))}
    </div>
  )
}

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [features, setFeatures] = useState([])
  const [recommended, setRecommended] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [localMin, setLocalMin] = useState('')
  const [localMax, setLocalMax] = useState('')

  const category    = searchParams.get('category') || ''
  const search      = searchParams.get('search') || ''
  const ordering    = searchParams.get('ordering') || ''
  const minPrice    = searchParams.get('min_price') || ''
  const maxPrice    = searchParams.get('max_price') || ''
  const condition   = searchParams.get('condition') || ''
  const minRating   = searchParams.get('min_rating') || ''
  const verifiedOnly = searchParams.get('verified_only') === 'true'
  const selectedBrands   = (searchParams.get('brand') || '').split(',').filter(Boolean)
  const selectedFeatures = (searchParams.get('feature') || '').split(',').filter(Boolean)
  const page     = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('page_size') || 10)

  // Sync local price state with URL
  useEffect(() => { setLocalMin(minPrice) }, [minPrice])
  useEffect(() => { setLocalMax(maxPrice) }, [maxPrice])

  useEffect(() => {
    api.get('/categories/').then((res) => setCategories(res.data.results || res.data))
    api.get('/brands/').then((res) => setBrands(res.data.results || res.data))
    api.get('/features/').then((res) => setFeatures(res.data.results || res.data))
    api.get('/products/', { params: { page_size: 4, ordering: '-rating' } })
      .then((res) => setRecommended(res.data.results || []))
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (category)              params.category     = category
      if (search)                params.search       = search
      if (ordering)              params.ordering     = ordering
      if (minPrice)              params.min_price    = minPrice
      if (maxPrice)              params.max_price    = maxPrice
      if (condition)             params.condition    = condition
      if (minRating)             params.min_rating   = minRating
      if (verifiedOnly)          params.verified_only = true
      if (selectedBrands.length) params.brand        = selectedBrands.join(',')
      if (selectedFeatures.length) params.feature    = selectedFeatures.join(',')
      const { data } = await api.get('/products/', { params })
      setProducts(data.results)
      setCount(data.count)
    } finally {
      setLoading(false)
    }
  }, [category, search, ordering, minPrice, maxPrice, condition, minRating,
      verifiedOnly, selectedBrands.join(','), selectedFeatures.join(','), page, pageSize])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const updateParam = (key, value, resetPage = true) => {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === false || value === null) next.delete(key)
    else next.set(key, String(value))
    if (resetPage) next.delete('page')
    setSearchParams(next)
  }

  const toggleListParam = (key, current, value) => {
    const set = new Set(current)
    set.has(value) ? set.delete(value) : set.add(value)
    updateParam(key, Array.from(set).join(','))
  }

  const clearAllFilters = () => {
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    if (search) next.set('search', search)
    setSearchParams(next)
  }

  const applyPrice = () => {
    const next = new URLSearchParams(searchParams)
    if (localMin) next.set('min_price', localMin); else next.delete('min_price')
    if (localMax) next.set('max_price', localMax); else next.delete('max_price')
    next.delete('page')
    setSearchParams(next)
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  // Active filter chips
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

  const removeChip = (chip) => {
    if (chip.key === 'brand')   toggleListParam('brand', selectedBrands, chip.value)
    else if (chip.key === 'feature') toggleListParam('feature', selectedFeatures, chip.value)
    else updateParam(chip.key, '')
  }

  // Category name for breadcrumb
  const activeCatName = categories.find((c) => c.slug === category)?.name || 'All products'

  // ── Sidebar JSX (shared between desktop & mobile)
  const SidebarContent = () => (
    <div className="space-y-0">

      {/* Category */}
      <FilterBlock title="Category">
        <ul className="space-y-2 text-sm">
          <li>
            <button
              onClick={() => updateParam('category', '')}
              className={`w-full text-left hover:text-brand-600 ${!category ? 'text-brand-600 font-semibold' : 'text-gray-600'}`}
            >
              All categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParam('category', cat.slug)}
                className={`w-full text-left hover:text-brand-600 ${category === cat.slug ? 'text-brand-600 font-semibold' : 'text-gray-600'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </FilterBlock>

      {/* Brands */}
      <FilterBlock title="Brands">
        <div className="space-y-2.5 text-sm">
          {brands.map((b) => (
            <label key={b.id} className="flex items-center gap-2.5 text-gray-600 cursor-pointer hover:text-gray-800">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.slug)}
                onChange={() => toggleListParam('brand', selectedBrands, b.slug)}
                className="accent-brand-500 h-4 w-4 rounded"
              />
              {b.name}
            </label>
          ))}
          {brands.length > 5 && (
            <button className="text-xs text-brand-600 hover:underline mt-1">See all</button>
          )}
        </div>
      </FilterBlock>

      {/* Features */}
      <FilterBlock title="Features">
        <div className="space-y-2.5 text-sm">
          {features.map((f) => (
            <label key={f.id} className="flex items-center gap-2.5 text-gray-600 cursor-pointer hover:text-gray-800">
              <input
                type="checkbox"
                checked={selectedFeatures.includes(String(f.id))}
                onChange={() => toggleListParam('feature', selectedFeatures, String(f.id))}
                className="accent-brand-500 h-4 w-4 rounded"
              />
              {f.name}
            </label>
          ))}
          {features.length > 5 && (
            <button className="text-xs text-brand-600 hover:underline mt-1">See all</button>
          )}
        </div>
      </FilterBlock>

      {/* Price Range — Figma style with slider track + Apply button */}
      <FilterBlock title="Price range">
        <div className="space-y-3">
          {/* Simple range visual */}
          <div className="relative h-1.5 bg-gray-200 rounded-full mx-1">
            <div className="absolute h-1.5 bg-brand-500 rounded-full" style={{ left: '10%', right: '30%' }} />
            <div className="absolute h-4 w-4 bg-white border-2 border-brand-500 rounded-full -top-[5px] shadow-sm" style={{ left: '8%' }} />
            <div className="absolute h-4 w-4 bg-white border-2 border-brand-500 rounded-full -top-[5px] shadow-sm" style={{ right: '28%' }} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 mb-1 block">Min</label>
              <input
                type="number"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 mb-1 block">Max</label>
              <input
                type="number"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                placeholder="999999"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-400"
              />
            </div>
          </div>
          <button
            onClick={applyPrice}
            className="w-full border border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      </FilterBlock>

      {/* Condition */}
      <FilterBlock title="Condition">
        <div className="space-y-2.5 text-sm">
          {CONDITIONS.map((c) => (
            <label key={c.value || 'any'} className="flex items-center gap-2.5 text-gray-600 cursor-pointer hover:text-gray-800">
              <input
                type="radio"
                name="condition"
                checked={condition === c.value}
                onChange={() => updateParam('condition', c.value)}
                className="accent-brand-500 h-4 w-4"
              />
              {c.label}
            </label>
          ))}
        </div>
      </FilterBlock>

      {/* Ratings */}
      <FilterBlock title="Ratings">
        <div className="space-y-2.5 text-sm">
          {RATINGS.map((r) => (
            <label key={r} className="flex items-center gap-2.5 text-gray-600 cursor-pointer hover:text-gray-800">
              <input
                type="checkbox"
                checked={minRating === String(r)}
                onChange={() => updateParam('min_rating', minRating === String(r) ? '' : String(r))}
                className="accent-brand-500 h-4 w-4 rounded"
              />
              <StarRow count={r} />
            </label>
          ))}
        </div>
      </FilterBlock>

      {/* Manufacturer (collapsible, closed by default) */}
      <FilterBlock title="Manufacturer" defaultOpen={false}>
        <p className="text-xs text-gray-400">No manufacturer filters available yet.</p>
      </FilterBlock>

    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <span>›</span>
          <span className="text-gray-500">{activeCatName}</span>
        </nav>

        <div className="flex gap-5">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside className="hidden md:block w-[220px] shrink-0 bg-white rounded-xl border border-gray-100 p-4 self-start sticky top-[80px]">
            <SidebarContent />
          </aside>

          {/* ── MOBILE SIDEBAR DRAWER ── */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
              <div className="relative bg-white w-72 h-full overflow-y-auto p-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800">Filters</h2>
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <FaTimes className="text-gray-500" />
                  </button>
                </div>
                <SidebarContent />
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full mt-4 bg-brand-500 text-white py-2.5 rounded-lg font-medium"
                >
                  Show {count} results
                </button>
              </div>
            </div>
          )}

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar */}
            <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3 mb-3">
              {/* Result count */}
              <p className="text-sm text-gray-500 flex-1">
                <span className="font-semibold text-gray-800">{count.toLocaleString()}</span> items in{' '}
                <span className="font-semibold text-gray-800">{activeCatName}</span>
              </p>

              {/* Verified only checkbox */}
              <label className="hidden md:flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => updateParam('verified_only', e.target.checked ? 'true' : '')}
                  className="accent-brand-500 h-4 w-4 rounded"
                />
                Verified only
              </label>

              {/* Sort */}
              <select
                value={ordering}
                onChange={(e) => updateParam('ordering', e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-400"
              >
                <option value="">Featured</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Top rated</option>
                <option value="-created_at">Newest</option>
              </select>

              {/* Grid / List toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 transition-colors ${view === 'grid' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <FaTh size={13} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 transition-colors ${view === 'list' ? 'bg-brand-500 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <FaList size={13} />
                </button>
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600"
              >
                <FaFilter size={11} /> Filter
                {chips.length > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                    {chips.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter chips — Figma style */}
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {chips.map((chip) => (
                  <button
                    key={`${chip.key}-${chip.value}`}
                    onClick={() => removeChip(chip)}
                    className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 bg-white hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    {chip.label}
                    <FaTimes size={9} />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  Clear all filter
                </button>
              </div>
            )}

            {/* Products */}
            {loading ? (
              <SkeletonGrid view={view} />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
                <p className="text-gray-400 text-sm">No products found. Try adjusting your filters.</p>
                <button onClick={clearAllFilters} className="mt-3 text-sm text-brand-600 hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((p) => <ProductCard key={p.id} product={p} listView />)}
              </div>
            )}

            {/* Pagination — Figma style */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
                {/* Page size selector */}
                <select
                  value={pageSize}
                  onChange={(e) => updateParam('page_size', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none"
                >
                  <option value="10">Show 10</option>
                  <option value="20">Show 20</option>
                  <option value="30">Show 30</option>
                  <option value="50">Show 50</option>
                </select>

                {/* Page buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateParam('page', String(page - 1), false)}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <FaChevronLeft size={11} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = i + 1
                    return (
                      <button
                        key={p}
                        onClick={() => updateParam('page', String(p), false)}
                        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors
                          ${page === p ? 'bg-brand-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  {totalPages > 5 && <span className="text-gray-400 px-1">…</span>}
                  <button
                    onClick={() => updateParam('page', String(page + 1), false)}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <FaChevronRight size={11} />
                  </button>
                </div>
              </div>
            )}

            {/* ── YOU MAY ALSO LIKE (Figma bottom section) ── */}
            {!loading && recommended.length > 0 && (
              <section className="mt-10">
                <h2 className="text-base font-bold text-gray-900 mb-4">You may also like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {recommended.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonGrid({ view }) {
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex gap-4 animate-pulse">
            <div className="h-[120px] w-[120px] bg-gray-100 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 py-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}