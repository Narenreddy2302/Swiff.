import { motion } from 'framer-motion';

const SetupRequired = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-lg shadow-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🚀</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Supabase Setup Required
            </h1>
            <p className="text-gray-600">
              Your app is almost ready! Just need to connect Supabase.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="font-semibold text-green-900 mb-2">
                Quick Setup (5 minutes)
              </h3>
              <p className="text-sm text-green-800">
                Supabase is an open-source Firebase alternative with a PostgreSQL database.
                It's easier to set up and has a better free tier!
              </p>
            </div>

            {/* Step-by-step */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Create Supabase Project
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Go to{' '}
                    <a
                      href="https://app.supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline font-semibold"
                    >
                      app.supabase.com
                    </a>{' '}
                    and sign up (it's free!)
                  </p>
                  <p className="text-sm text-gray-600">
                    Click "New Project" and fill in:
                  </p>
                  <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                    <li>• Name: <strong>Swiff</strong></li>
                    <li>• Database Password: (save this!)</li>
                    <li>• Region: Choose closest to you</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Get API Keys
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    In your Supabase project, go to:
                    <br />
                    <strong>Settings → API</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Copy these two values:
                  </p>
                  <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                    <li>• <strong>Project URL</strong></li>
                    <li>• <strong>anon public key</strong></li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Enable Authentication
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Go to: <strong>Authentication → Providers</strong>
                  </p>
                  <ul className="text-sm text-gray-600 ml-4 space-y-1">
                    <li>• <strong>Email</strong> is enabled by default ✅</li>
                    <li>• For Google: Click "Google" → Enable → Add Client ID & Secret</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Create Users Table
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Go to: <strong>SQL Editor</strong> → Click "New query"
                  </p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);`}
                  </pre>
                  <p className="text-xs text-gray-500 mt-2">
                    Click "Run" to execute
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Update .env.local File
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Open <code className="bg-gray-100 px-2 py-1 rounded">swiff/.env.local</code> and add:</p>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Reload & Test!
                  </h4>
                  <p className="text-sm text-gray-600">
                    Save the file and click the button below to reload the page.
                  </p>
                </div>
              </div>
            </div>

            {/* Why Supabase */}
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold text-gray-900 mb-2">✨ Why Supabase?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Easier setup</strong> - 5 mins vs 15 mins for Firebase</li>
                <li>• <strong>Better free tier</strong> - 500MB database, 50K monthly users</li>
                <li>• <strong>PostgreSQL database</strong> - More powerful than Firestore</li>
                <li>• <strong>Open source</strong> - Can self-host if needed</li>
                <li>• <strong>Built-in auth</strong> - Email, Google, GitHub, and more</li>
              </ul>
            </div>

            {/* Documentation Links */}
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-semibold text-blue-900 mb-2">📚 Need Help?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  •{' '}
                  <a
                    href="https://supabase.com/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Supabase Documentation
                  </a>
                </li>
                <li>• Check <strong>README.md</strong> in your project</li>
              </ul>
            </div>

            {/* Reload Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg"
              >
                I've Added Supabase Config - Reload App
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetupRequired;
