import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-tesla-white/95 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">Swiff</div>
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-tesla-gray transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/groups"
              className="text-sm font-medium hover:text-tesla-gray transition-colors"
            >
              Groups
            </Link>
            <button className="px-6 py-2 bg-tesla-black text-tesla-white text-sm font-medium rounded-md hover:bg-tesla-gray transition-colors">
              Sign In
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
            Split Expenses
            <br />
            <span className="text-tesla-red">Effortlessly</span>
          </h1>
          <p className="text-xl md:text-2xl text-tesla-light-gray max-w-3xl mx-auto mb-12 leading-relaxed">
            Share bills with friends, track group expenses, and settle up with ease.
            The modern way to manage shared costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-10 py-4 bg-tesla-black text-tesla-white font-medium rounded-md hover:bg-tesla-gray transition-all hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="px-10 py-4 border-2 border-tesla-black text-tesla-black font-medium rounded-md hover:bg-tesla-black hover:text-tesla-white transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-tesla-black text-tesla-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-tesla-red rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Add Expenses</h3>
              <p className="text-tesla-light-gray text-lg leading-relaxed">
                Quickly add and split expenses with your groups. Simple, fast, efficient.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-tesla-red rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Manage Groups</h3>
              <p className="text-tesla-light-gray text-lg leading-relaxed">
                Create groups for trips, households, or any shared expenses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-tesla-red rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Settle Up</h3>
              <p className="text-tesla-light-gray text-lg leading-relaxed">
                Track balances and settle debts with one tap. Stay on top of who owes what.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-tesla-light-gray mb-12">
            Join thousands who manage expenses the modern way.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-12 py-5 bg-tesla-red text-tesla-white text-lg font-medium rounded-md hover:bg-opacity-90 transition-all hover:scale-105"
          >
            Start Splitting Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-tesla-light-gray/20 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-tesla-light-gray">
          <p>© 2025 Swiff. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
