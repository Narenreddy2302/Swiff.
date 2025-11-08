/**
 * Mock Authentication Service for Development
 * Allows instant login with ANY credentials - no backend needed!
 */

const MOCK_USER_KEY = 'mock_user';
const MOCK_SESSION_KEY = 'mock_session';

// Generate a fake UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Mock sign up - accepts any credentials
 */
export const signUpWithEmail = async (email, password, displayName) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const userId = generateUUID();
  const user = {
    id: userId,
    email: email,
    user_metadata: {
      display_name: displayName,
    },
    created_at: new Date().toISOString(),
  };

  const userData = {
    id: userId,
    email: email,
    display_name: displayName,
    photo_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preferences: {
      theme: 'light',
      currency: 'USD',
      notifications: true,
    },
  };

  // Store in localStorage
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user, userData }));

  return user;
};

/**
 * Mock sign in - accepts any credentials
 */
export const signInWithEmail = async (email, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if user exists in localStorage
  let user = JSON.parse(localStorage.getItem(MOCK_USER_KEY));

  if (!user || user.email !== email) {
    // Create new user if doesn't exist or email doesn't match
    const userId = generateUUID();
    user = {
      id: userId,
      email: email,
      user_metadata: {
        display_name: email.split('@')[0], // Use email username as display name
      },
      created_at: new Date().toISOString(),
    };

    const userData = {
      id: userId,
      email: email,
      display_name: email.split('@')[0],
      photo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      preferences: {
        theme: 'light',
        currency: 'USD',
        notifications: true,
      },
    };

    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user, userData }));
  }

  return user;
};

/**
 * Mock Google sign in
 */
export const signInWithGoogle = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const userId = generateUUID();
  const user = {
    id: userId,
    email: 'user@gmail.com',
    user_metadata: {
      display_name: 'Google User',
      avatar_url: 'https://ui-avatars.com/api/?name=Google+User',
    },
    created_at: new Date().toISOString(),
  };

  const userData = {
    id: userId,
    email: 'user@gmail.com',
    display_name: 'Google User',
    photo_url: 'https://ui-avatars.com/api/?name=Google+User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    preferences: {
      theme: 'light',
      currency: 'USD',
      notifications: true,
    },
  };

  localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ user, userData }));

  return { user };
};

/**
 * Mock sign out
 */
export const logOut = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  localStorage.removeItem(MOCK_USER_KEY);
  localStorage.removeItem(MOCK_SESSION_KEY);
};

/**
 * Mock password reset
 */
export const resetPassword = async (email) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Mock: Password reset email sent to:', email);
};

/**
 * Mock resend verification email
 */
export const resendVerificationEmail = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const user = JSON.parse(localStorage.getItem(MOCK_USER_KEY));
  if (user) {
    console.log('Mock: Verification email resent to:', user.email);
  } else {
    throw new Error('No user found to resend verification email');
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  const sessionData = localStorage.getItem(MOCK_SESSION_KEY);
  if (sessionData) {
    return { session: JSON.parse(sessionData) };
  }
  return { session: null };
};

/**
 * Get user data
 */
export const getUserData = async (userId) => {
  const sessionData = localStorage.getItem(MOCK_SESSION_KEY);
  if (sessionData) {
    const { userData } = JSON.parse(sessionData);
    return userData;
  }
  return null;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  const sessionData = localStorage.getItem(MOCK_SESSION_KEY);
  if (sessionData) {
    const session = JSON.parse(sessionData);
    session.userData = {
      ...session.userData,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
    return session.userData;
  }
  return null;
};

/**
 * Listen to auth state changes
 * Returns a subscription object that can be unsubscribed
 */
export const onAuthStateChange = (callback) => {
  // Check initial state
  const sessionData = localStorage.getItem(MOCK_SESSION_KEY);
  if (sessionData) {
    const session = JSON.parse(sessionData);
    setTimeout(() => callback('SIGNED_IN', session), 0);
  } else {
    setTimeout(() => callback('SIGNED_OUT', null), 0);
  }

  // Listen for storage changes (for multi-tab support)
  const handleStorageChange = (e) => {
    if (e.key === MOCK_SESSION_KEY) {
      if (e.newValue) {
        const session = JSON.parse(e.newValue);
        callback('SIGNED_IN', session);
      } else {
        callback('SIGNED_OUT', null);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return {
    data: {
      subscription: {
        unsubscribe: () => {
          window.removeEventListener('storage', handleStorageChange);
        },
      },
    },
  };
};
