import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-bg via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-gradient-primary text-white rounded-full text-sm font-semibold shadow-soft">
              ✨ Modern Digital Cards
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-6">
            <span className="gradient-text">Your Digital</span>
            <br />
            <span className="text-gray-900 dark:text-white">Business Card</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Create a beautiful profile, share your links, and connect with NFC. 
            <span className="block mt-2 text-lg text-gray-500 dark:text-gray-400">
              Modern, minimal, and professional.
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-gradient-primary text-white rounded-2xl hover:opacity-90 text-lg font-semibold shadow-soft-lg hover:shadow-glow transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 glass text-gray-900 dark:text-white rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 text-lg font-semibold shadow-soft transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="glass p-8 rounded-3xl shadow-soft-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform border border-white/20">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-heading font-semibold mb-3 text-gray-900 dark:text-white">
              Customizable Profile
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Add your photo, banner, and personal information to create a unique
              profile that stands out
            </p>
          </div>
          
          <div className="glass p-8 rounded-3xl shadow-soft-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform border border-white/20">
              <svg className="w-8 h-8 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-2xl font-heading font-semibold mb-3 text-gray-900 dark:text-white">
              Social Links
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Share all your social media profiles and websites in one beautiful, 
              organized place
            </p>
          </div>
          
          <div className="glass p-8 rounded-3xl shadow-soft-lg hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform border border-white/20">
              <svg className="w-8 h-8 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-heading font-semibold mb-3 text-gray-900 dark:text-white">
              NFC Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Connect NFC keychains to instantly share your profile with a simple tap
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-20 text-center">
          <div className="glass p-12 rounded-3xl shadow-soft-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold mb-6 text-gray-900 dark:text-white">
              Everything you need in one place
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft border border-white/20">
                  <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Themes</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft border border-white/20">
                  <svg className="w-7 h-7 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Analytics</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft border border-white/20">
                  <svg className="w-7 h-7 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">VCF Export</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft border border-white/20">
                  <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

