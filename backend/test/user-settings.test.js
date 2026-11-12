const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createUsersRouter } = require('../src/modules/users/users.routes');
const { createAuthHandlers } = require('../src/modules/auth/auth.routes');
const { createUsersRepository } = require('../src/modules/users/users.repository');

async function fixture(t) {
  const calls = [];
  const csrf = createAuthHandlers({ config: { origin: 'https://petpals.example' } }).csrf;
  const app = express();
  app.use(express.json());
  app.use('/api/users', createUsersRouter({ csrf,
    loadSession(req, res, next) {
      req.auth = { user: req.headers.authorization ? { id: 12 } : null,
        session: { data: { csrf: 'test-csrf' } } };
      next();
    },
    repository: { async updateProfile(id, fields) {
      calls.push({ id, fields });
      if (fields.first_name === 'Missing') return null;
      if (fields.first_name === 'Failure') throw new Error('private database secret');
      return { id, ...fields };
    } },
  }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  return { calls, request: (body, headers = {}) => fetch(`http://127.0.0.1:${server.address().port}/api/users/me?user_id=999`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', authorization: 'fixture',
      origin: 'https://petpals.example', 'x-csrf-token': 'test-csrf', ...headers }, body: JSON.stringify(body),
  }) };
}

test('settings require authentication and matching Origin and CSRF token', async (t) => {
  const f = await fixture(t);
  for (const [headers, status] of [[{ authorization: '' }, 401], [{ origin: 'https://evil.example' }, 403],
    [{ 'x-csrf-token': '' }, 403]]) {
    assert.equal((await f.request({ first_name: 'Ana' }, headers)).status, status);
  }
  assert.deepEqual(f.calls, []);
});

test('PATCH trims names, allows removing a photo and uses only session identity', async (t) => {
  const f = await fixture(t);
  const response = await f.request({ first_name: ' Ana ', photo_url: null });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { profile: { id: 12, first_name: 'Ana', photo_url: null } });
  assert.deepEqual(f.calls, [{ id: 12, fields: { first_name: 'Ana', photo_url: null } }]);
  assert.equal((await f.request({ photo_url: 'https://example.com/photo.png' })).status, 200);
});

test('rejects unknown, privileged and malformed fields without updating anything', async (t) => {
  const f = await fixture(t);
  for (const body of [{}, [], { role: 'administrator' }, { email: 'new@example.com' },
    { verification_status: 'approved' }, { first_name: ' ' }, { last_name: 'x'.repeat(101) },
    { first_name: null }, { photo_url: 'http://example.com/a' }, { photo_url: 'javascript:alert(1)' },
    { photo_url: 'https://user:password@example.com' }, { photo_url: 123 }, { first_name: 'Ana', id: 999 }]) {
    assert.equal((await f.request(body)).status, 400, JSON.stringify(body));
  }
  assert.deepEqual(f.calls, []);
});

test('missing users and database failures return safe errors', async (t) => {
  const f = await fixture(t);
  assert.equal((await f.request({ first_name: 'Missing' })).status, 404);
  const response = await f.request({ first_name: 'Failure' });
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /secret/);
});

test('repository distinguishes omitted fields from explicit null in one scoped atomic update', async () => {
  const calls = [];
  const repository = createUsersRepository({ async query(sql, values) {
    calls.push({ sql, values }); return { rows: [{ id: 12 }] };
  } });
  assert.deepEqual(await repository.updateProfile(12, { photo_url: null }), { id: 12 });
  assert.deepEqual(calls[0].values, [12, false, null, false, null, true, null]);
  await repository.updateProfile(12, { first_name: 'Ana' });
  assert.deepEqual(calls[1].values, [12, true, 'Ana', false, null, false, null]);
  assert.match(calls[0].sql, /WHERE id = \$1/);
  assert.match(calls[0].sql, /first_name IS DISTINCT FROM \$3/);
});
