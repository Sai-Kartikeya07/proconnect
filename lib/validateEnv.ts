// Simple runtime environment validation and warning utility.
// This does not throw (to avoid blocking dev), but logs clear warnings once.

const requiredCore = [
  'NEON_DATABASE_URL',
  'CLERK_SECRET_KEY',
  'AZURE_STORAGE_ACCOUNT_KEY',
  'AZURE_STORAGE_NAME'
];

const optionalButRecommended = [
  'RESEND_API_KEY',
  'NOTIFY_FROM_EMAIL'
];

function check(list: string[], level: 'required' | 'optional') {
  for (const key of list) {
    if (!process.env[key]) {
      if (level === 'required') {
        console.warn(`[env] Missing REQUIRED variable: ${key}`);
      } else {
        console.warn(`[env] Missing optional variable: ${key} (feature may be limited)`);
      }
    }
  }
}

let alreadyLogged = false;
if (!alreadyLogged) {
  check(requiredCore, 'required');
  check(optionalButRecommended, 'optional');
  alreadyLogged = true;
}

// Export a typed-ish helper if you want to import and use from other modules.
export const env = {
  NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  AZURE_STORAGE_ACCOUNT_KEY: process.env.AZURE_STORAGE_ACCOUNT_KEY || '',
  AZURE_STORAGE_NAME: process.env.AZURE_STORAGE_NAME || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NOTIFY_FROM_EMAIL: process.env.NOTIFY_FROM_EMAIL,
};
