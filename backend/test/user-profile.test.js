const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createUsersRouter } = require('../src/modules/users/users.routes');
const { createUsersRepository } = require('../src/modules/users/users.repository');
const { createAuthHandlers } = require('../src/modules/auth/auth.routes');
const { randomToken } = require('../src/modules/auth/auth.security');

async function fixture(t, { role = 'owner', status = 'pending', purpose = 'authenticated',
  suspended = false, expired = false, failSession = false, failProfile = false, missingProfile = false } = {}) {
  const token = randomToken();
  const user = { id: 12, first_name: 'Ana', last_name: 'Test', email: 'ana@example.com',
    photo_url: null, role, verification_status: status,
    suspended_until: suspended ? new Date(Date.now() + 60000).toISOString() : null };
  const calls = [];
  const auth = createAuthHandlers({
    config: { cookieName: 'petpals', secure: false },
    repository: {
      async findSession(received) {
        if (failSession) throw new Error('private database connection details');
        if (received !== token || expired) return null;
        return { purpose, user_id: 12, data: {}, absolute_expires_at: new Date(Date.now() + 60000) };
      },
      async findUserById(id) { assert.equal(id, 12); return user; },
      async touchSession() {},
    },
  });
  const app = express();
  app.use('/api/users', createUsersRouter({ loadSession: auth.loadSession, repository: {
    async findProfile(id) {
      calls.push(['profile', id]);
      if (failProfile) throw new Error('private database connection details');
      return missingProfile ? null : { ...user, created_at: '2026-11-10T12:00:00.000Z' };
    },
    async findPets(id) { calls.push(['pets', id]); return [{ id: 3, name: 'Luna', care_notes: 'Private owner note' }]; },
    async findActiveListings(id) { calls.push(['listings', id]); return [{ id: 4, status: 'published', rate: '10.00' }]; },
  } }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}/api/users`;
  return { calls, request: (path = '/me', authenticated = true, options = {}) => fetch(`${base}${path}`, {
    headers: authenticated ? { cookie: `petpals=${token}` } : {}, ...options,
  }) };
}

test('anonymous, expired and unfinished registration sessions cannot view profiles', async (t) => {
  for (const options of [{ anonymous: true }, { expired: true }, { purpose: 'registration' }, { purpose: 'oauth' }]) {
    const f = await fixture(t, options);
    const response = await f.request('/me', !options.anonymous);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(f.calls, []);
  }
});

test('pending owner sees their pets and cannot override session identity using query parameters', async (t) => {
  const f = await fixture(t);
  const response = await f.request('/me?user_id=999&owner_id=999&role=helper');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.profile.id, 12);
  assert.equal(body.profile.verification_status, 'pending');
  assert.equal(body.pets[0].name, 'Luna');
  assert.deepEqual(body.active_listings, []);
  assert.deepEqual(f.calls, [['profile', 12], ['pets', 12]]);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('helper sees active listings and no private pet collection', async (t) => {
  const f = await fixture(t, { role: 'helper' });
  const response = await f.request();
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body.pets, []);
  assert.equal(body.active_listings[0].status, 'published');
  assert.deepEqual(f.calls, [['profile', 12], ['listings', 12]]);
});

test('administrator receives only their own profile', async (t) => {
  const f = await fixture(t, { role: 'administrator' });
  const body = await (await f.request()).json();
  assert.deepEqual(body.pets, []);
  assert.deepEqual(body.active_listings, []);
  assert.deepEqual(f.calls, [['profile', 12]]);
});

test('rejected and suspended users retain access to their own profile', async (t) => {
  for (const options of [{ status: 'rejected' }, { suspended: true }]) {
    const f = await fixture(t, options);
    assert.equal((await f.request()).status, 200);
  }
});

test('missing profile returns 404; session and profile failures return safe JSON', async (t) => {
  const missing = await fixture(t, { missingProfile: true });
  assert.equal((await missing.request()).status, 404);
  for (const options of [{ failSession: true }, { failProfile: true }]) {
    const f = await fixture(t, options);
    const response = await f.request();
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: 'Profile is temporarily unavailable. Please try again later.' });
  }
});

test('there is no arbitrary-user lookup or profile mutation endpoint in step one', async (t) => {
  const f = await fixture(t);
  assert.equal((await f.request('/999')).status, 404);
  assert.equal((await f.request('/me', true, { method: 'PATCH' })).status, 404);
  assert.equal((await f.request('/me', true, { method: 'DELETE' })).status, 404);
  assert.deepEqual(f.calls, []);
});

test('queries scope pets/listings to ownership, exclude nonpublished listings and select safe profile fields', async () => {
  const queries = [];
  const repository = createUsersRepository({ async query(sql, values) {
    queries.push({ sql, values });
    return { rows: [] };
  } });
  assert.equal(await repository.findProfile(12), null);
  assert.deepEqual(await repository.findPets(12), []);
  assert.deepEqual(await repository.findActiveListings(12), []);
  for (const query of queries) assert.deepEqual(query.values, [12]);
  assert.match(queries[0].sql, /WHERE id = \$1/);
  assert.doesNotMatch(queries[0].sql, /SELECT \*|google_subject|calendar_credential_ref|reviewed_by|created_by/);
  assert.match(queries[1].sql, /WHERE owner_id = \$1/);
  assert.match(queries[1].sql, /to_char\(birth_date, 'YYYY-MM-DD'\)/);
  assert.match(queries[2].sql, /listing.helper_id = \$1 AND listing.status = 'published'/);
});
