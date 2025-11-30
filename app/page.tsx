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
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform">
              <span className="text-3xl">👤</span>
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
            <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform">
              <span className="text-3xl">🔗</span>
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
            <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mb-6 shadow-soft group-hover:scale-110 transition-transform">
              <span className="text-3xl">📱</span>
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
                <div className="text-4xl mb-2">🎨</div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Themes</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Analytics</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">📥</div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">VCF Export</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🔒</div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

