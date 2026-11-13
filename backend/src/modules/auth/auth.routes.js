const { randomToken, pkceChallenge, equalSecret, readCookie, registrationFields } = require('./auth.security');

function createAuthHandlers({ config, repository, google }) {
  const cookieOptions = { httpOnly: true, secure: config.secure, sameSite: 'lax', path: '/' };
  const getToken = (req) => readCookie(req.headers.cookie, config.cookieName);
  const setSession = (res, session) => res.cookie(config.cookieName, session.token,
    { ...cookieOptions, maxAge: session.maxAge });
  const clearCookie = (res) => res.clearCookie(config.cookieName, cookieOptions);

  async function loadSession(req, res, next) {
    const token = getToken(req);
    const session = await repository.findSession(token);
    req.auth = { token, session, user: null };
    if (session?.purpose === 'authenticated') {
      req.auth.user = await repository.findUserById(session.user_id);
      if (!req.auth.user) {
        await repository.destroySession(token);
        clearCookie(res);
        req.auth.session = null;
      } else {
        await repository.touchSession(token);
        const remaining = new Date(session.absolute_expires_at).getTime() - Date.now();
        setSession(res, { token, maxAge: Math.min(1800000, Math.max(0, remaining)) });
      }
    }
    next();
  }

  function csrf(req, res, next) {
    if (req.headers.origin !== config.origin
        || !equalSecret(req.headers['x-csrf-token'], req.auth?.session?.data.csrf)) {
      return res.status(403).json({ error: 'Invalid origin or CSRF token.' });
    }
    next();
  }

  async function start(req, res) {
    if (!config.clientId || !config.clientSecret) {
      return res.status(503).json({ error: 'not_configured' });
    }
    const state = randomToken();
    const nonce = randomToken();
    const verifier = randomToken();
    await repository.deleteExpiredSessions();
    await repository.destroySession(getToken(req));
    const session = await repository.createSession('oauth', { state, nonce, verifier });
    setSession(res, session);
    res.redirect(google.authorizationUrl({ state, nonce, challenge: pkceChallenge(verifier) }));
  }

  async function callback(req, res) {
    const token = getToken(req);
    const session = await repository.findSession(token);
    if (session?.purpose !== 'oauth' || !equalSecret(req.query.state, session.data.state)) {
      return res.status(400).json({ error: 'invalid_state' });
    }
    // Consume before contacting Google, making callbacks single-use.
    const attempt = await repository.consumeOauth(token);
    if (!attempt) return res.status(400).json({ error: 'invalid_state' });
    clearCookie(res);
    if (req.query.error) return res.status(400).json({ error: 'cancelled' });
    if (typeof req.query.code !== 'string' || !req.query.code || req.query.code.length > 4096) {
      return res.status(400).json({ error: 'google_failed' });
    }
    let identity;
    try {
      identity = await google.exchange(req.query.code, attempt.verifier, attempt.nonce);
    } catch {
      // Never log provider exceptions: they can contain codes or credentials.
      return res.status(401).json({ error: 'google_failed' });
    }
    const user = await repository.findUserBySubject(identity.subject);
    const data = { csrf: randomToken() };
    if (!user) data.identity = identity;
    const next = await repository.createSession(user ? 'authenticated' : 'registration', data, user?.id);
    setSession(res, next);
    res.redirect(user ? '/profile' : '/api/auth/me');
  }

  function me(req, res) {
    const { session, user } = req.auth;
    if (user) return res.json({ user, csrfToken: session.data.csrf });
    if (session?.purpose === 'registration') {
      const identity = session.data.identity;
      return res.json({ registrationRequired: true, csrfToken: session.data.csrf,
        profile: { first_name: identity.firstName, last_name: identity.lastName, email: identity.email } });
    }
    return res.status(401).json({ error: 'Sign in first.' });
  }

  async function register(req, res) {
    if (req.auth.session?.purpose !== 'registration') {
      return res.status(409).json({ error: 'Start Google sign-in before registering.' });
    }
    const fields = registrationFields(req.body);
    const result = await repository.register(req.auth.token, fields);
    setSession(res, result.session);
    res.status(201).json({ user: result.user });
  }

  async function logout(req, res) {
    await repository.destroySession(req.auth.token);
    clearCookie(res);
    res.status(204).end();
  }

  return { loadSession, csrf, start, callback, me, register, logout };
}

function createAuthRouter(dependencies) {
  const router = require('express').Router();
  const handlers = createAuthHandlers(dependencies);
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('Referrer-Policy', 'no-referrer');
    next();
  });
  router.get('/google', handlers.start);
  router.get('/google/callback', handlers.callback);
  router.use(handlers.loadSession);
  router.get('/me', handlers.me);
  router.post('/register', handlers.csrf, handlers.register);
  router.post('/logout', handlers.csrf, handlers.logout);
  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status === 400 || error.status === 401 ? error.status : 503;
    res.status(status).json({ error: status === 503
      ? 'Sign-in is temporarily unavailable. Please try again later.' : error.message });
  });
  return router;
}

module.exports = { createAuthRouter, createAuthHandlers };
