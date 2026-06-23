import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube, FaApple, FaGooglePlay } from 'react-icons/fa'

const FOOTER_COLS = [
  {
    title: 'About',
    links: [
      { label: 'About Us', to: '/products' },
      { label: 'Find store', to: '/products' },
      { label: 'Categories', to: '/products' },
      { label: 'Blogs', to: '/products' },
    ],
  },
  {
    title: 'Partnership',
    links: [
      { label: 'About Us', to: '/products' },
      { label: 'Find store', to: '/products' },
      { label: 'Categories', to: '/products' },
      { label: 'Blogs', to: '/products' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'Help Center', to: '/products' },
      { label: 'Money Refund', to: '/products' },
      { label: 'Shipping', to: '/products' },
      { label: 'Contact us', to: '/products' },
    ],
  },
  {
    title: 'For users',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/signup' },
      { label: 'Settings', to: '/products' },
      { label: 'My Orders', to: '/products' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3 w-max">
              <div className="h-9 w-9 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-base">B</div>
              <span className="text-lg font-bold text-gray-900">Brand</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-xs">
              Best information about the company gies here but now lorem ipsum is
            </p>
            <div className="flex items-center gap-2">
              <SocialBtn icon={<FaFacebookF size={13} />} />
              <SocialBtn icon={<FaTwitter size={13} />} />
              <SocialBtn icon={<FaLinkedinIn size={13} />} />
              <SocialBtn icon={<FaInstagram size={13} />} />
              <SocialBtn icon={<FaYoutube size={13} />} />
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(function(col) {
            return (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-gray-800 mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(function(link) {
                    return (
                      <li key={link.label}>
                        <Link to={link.to} className="text-sm text-gray-400 hover:text-brand-600 transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          {/* Get app column */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-4">Get app</h4>
            <div className="flex flex-col gap-2">
              <a href="#" className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors">
                <FaApple size={20} className="text-gray-700 shrink-0" />
                <div>
                  <p className="text-[9px] text-gray-400 leading-none">Download on the</p>
                  <p className="text-xs font-semibold text-gray-800 leading-none mt-0.5">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors">
                <FaGooglePlay size={18} className="text-green-500 shrink-0" />
                <div>
                  <p className="text-[9px] text-gray-400 leading-none">GET IT ON</p>
                  <p className="text-xs font-semibold text-gray-800 leading-none mt-0.5">Google Play</p>
                </div>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Ecommerce. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>🇺🇸</span>
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialBtn({ icon }) {
  return (
    <a href="#" className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors">
      {icon}
    </a>
  )
}