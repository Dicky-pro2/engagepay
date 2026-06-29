// src/config/env.ts
// All environment variables go through here — never import import.meta.env directly
// in components. This makes it easy to see all config in one place and
// swap values between dev/staging/production without touching component code.

const env = {
  // API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  
  // App
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'EngagePay',
  APP_URL: import.meta.env.VITE_APP_URL ?? 'http://localhost:5173',
  
  // Auth
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  
  // Paystack
  PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? '',
  
  // Feature flags
  IS_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_API_BASE_URL,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,

  // Misc
  APP_VERSION: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
} as const;

// Validate required variables in production
if (env.IS_PROD) {
  const required = [
    'VITE_API_BASE_URL',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_PAYSTACK_PUBLIC_KEY',
  ] as const;

  required.forEach((key) => {
    if (!import.meta.env[key]) {
      console.warn(`Missing environment variable: ${key}`);
    }
  });
}

export default env;