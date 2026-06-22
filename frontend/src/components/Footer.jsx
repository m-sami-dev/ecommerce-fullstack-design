import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">B</div>
            <span className="text-lg font-bold text-gray-900">Brand</span>
          </div>
          <p className="text-sm text-gray-500 mb-3">
            A sample storefront built for the eCommerce internship project.
          </p>
          <div className="flex gap-3 text-gray-400">
            <FaFacebookF /> <FaTwitter /> <FaLinkedinIn /> <FaInstagram /> <FaYoutube />
          </div>
        </div>
        <FooterColumn title="About" items={['About Us', 'Find store', 'Categories', 'Blogs']} />
        <FooterColumn title="Partnership" items={['About Us', 'Find store', 'Categories', 'Blogs']} />
        <FooterColumn title="Information" items={['Help Center', 'Money Refund', 'Shipping', 'Contact us']} />
        <FooterColumn title="For users" items={['Login', 'Register', 'Settings', 'My Orders']} />
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Brand Ecommerce. All rights reserved.
      </div>
    </footer>
  )
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-3 text-sm">{title}</h4>
      <ul className="space-y-2 text-sm text-gray-500">
        {items.map((item) => (
          <li key={item} className="hover:text-brand-600 cursor-pointer">{item}</li>
        ))}
      </ul>
    </div>
  )
}
