function readAuthConfig(env = process.env) {
  const base = new URL(env.AUTH_BASE_URL || 'http://localhost:10000');
  if (base.username || base.password || base.search || base.hash || base.pathname !== '/') {
    throw new Error('AUTH_BASE_URL must be an origin without credentials, path or query');
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && local && env.NODE_ENV !== 'production')) {
    throw new Error('AUTH_BASE_URL must use HTTPS except for local development');
  }
  return {
    origin: base.origin,
    callbackUrl: `${base.origin}/api/auth/google/callback`,
    clientId: env.GOOGLE_CLIENT_ID || '',
    clientSecret: env.GOOGLE_CLIENT_SECRET || '',
    secure: base.protocol === 'https:',
    cookieName: base.protocol === 'https:' ? '__Host-petpals' : 'petpals',
  };
}

module.exports = { readAuthConfig };
