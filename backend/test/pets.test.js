const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const sharp = require('sharp');
const { createPetsRouter } = require('../src/modules/pets/pets.routes');
const { createPetsRepository } = require('../src/modules/pets/pets.repository');
const { createAuthHandlers } = require('../src/modules/auth/auth.routes');

const valid = { name: ' Luna ', species: 'Dog', birth_date: '2020-02-29', photo_url: 'https://example.com/pet.jpg' };

async function fixture(t) {
  const pets = new Map();
  let nextId = 1;
  const app = express();
  const csrf = createAuthHandlers({ config: { origin: 'https://petpals.example' } }).csrf;
  app.use('/api/pets', createPetsRouter({ csrf,
    loadSession(req, res, next) {
      req.auth = { user: req.headers.authorization ? {
        id: Number(req.headers.authorization), role: req.headers['x-test-role'] || 'owner', verification_status: 'pending',
      } : null, session: { data: { csrf: 'csrf' } } };
      next();
    },
    repository: {
      async findAll(ownerId) { return [...pets.values()].filter(pet => pet.owner_id === ownerId); },
      async create(ownerId, fields) {
        if (fields.name === 'Failure') throw new Error('secret database connection');
        const pet = { id: nextId++, owner_id: ownerId, ...fields };
        pets.set(pet.id, pet);
        return pet;
      },
      async update(ownerId, id, fields) {
        if (pets.get(id)?.owner_id !== ownerId) return null;
        const updated = { ...pets.get(id), ...fields };
        pets.set(id, updated);
        return updated;
      },
      async remove(ownerId, id) {
        if (pets.get(id)?.owner_id !== ownerId) return false;
        if (pets.get(id).name === 'Booked') throw Object.assign(new Error('private constraint'), { code: '23503' });
        return pets.delete(id);
      },
    },
  }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return { pets, request: (method = 'GET', path = '', body, headers = {}) => fetch(
    `http://127.0.0.1:${server.address().port}/api/pets${path}`, {
      method, headers: { authorization: '12', origin: 'https://petpals.example',
        'x-csrf-token': 'csrf', 'content-type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    }) };
}

test('owner creates, reloads, edits and deletes pets through HTTP', async (t) => {
  const f = await fixture(t);
  const response = await f.request('POST', '', valid);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const { pet } = await response.json();
  assert.equal(pet.name, 'Luna');
  assert.equal(pet.owner_id, 12);
  assert.equal(pet.birth_date, '2020-02-29');
  assert.deepEqual((await (await f.request()).json()).pets, [pet]);
  const edited = await f.request('PATCH', `/${pet.id}`, { name: 'Luna II', breed: null });
  assert.equal(edited.status, 200);
  assert.equal((await edited.json()).pet.name, 'Luna II');
  assert.equal((await f.request('DELETE', `/${pet.id}`)).status, 204);
  assert.deepEqual((await (await f.request()).json()).pets, []);
});

test('anonymous and non-owner accounts cannot manage pets; writes require CSRF and Origin', async (t) => {
  const f = await fixture(t);
  assert.equal((await f.request('GET', '', undefined, { authorization: '' })).status, 401);
  for (const role of ['helper', 'administrator']) {
    assert.equal((await f.request('GET', '', undefined, { 'x-test-role': role })).status, 403);
    assert.equal((await f.request('POST', '', valid, { 'x-test-role': role })).status, 403);
  }
  for (const method of ['POST', 'PATCH', 'DELETE']) {
    const path = method === 'POST' ? '' : '/1';
    for (const headers of [{ 'x-csrf-token': '' }, { origin: 'https://evil.example' }]) {
      assert.equal((await f.request(method, path, method === 'DELETE' ? undefined : valid, headers)).status, 403);
    }
  }
  assert.equal(f.pets.size, 0);
});

test('owners cannot see, edit, delete or take ownership of another owner’s pet', async (t) => {
  const f = await fixture(t);
  await f.request('POST', '', valid);
  const other = { authorization: '99' };
  assert.deepEqual((await (await f.request('GET', '?owner_id=12', undefined, other)).json()).pets, []);
  assert.equal((await f.request('PATCH', '/1', { name: 'Stolen' }, other)).status, 404);
  assert.equal((await f.request('DELETE', '/1', undefined, other)).status, 404);
  assert.equal((await f.request('PATCH', '/1', { owner_id: 99 })).status, 400);
  assert.equal((await f.request('POST', '', { ...valid, owner_id: 99 })).status, 400);
  assert.equal(f.pets.get(1).owner_id, 12);
  assert.equal(f.pets.get(1).name, 'Luna');
});

test('invalid pet details and IDs fail before a database write', async (t) => {
  const f = await fixture(t);
  for (const body of [{}, [], { ...valid, name: ' ' }, { ...valid, species: 'x'.repeat(101) },
    { ...valid, care_notes: 'x'.repeat(1001) }, { ...valid, birth_date: '2023-02-29' },
    { ...valid, birth_date: '9999-01-01' }, { ...valid, birth_date: 'not a date' },
    { ...valid, photo_url: 'javascript:alert(1)' }, { ...valid, photo_url: null },
    { ...valid, photo_url: 'data:image/png;base64,AAAA' }]) {
    assert.equal((await f.request('POST', '', body)).status, 400, JSON.stringify(body));
  }
  for (const id of ['0', '-1', 'abc', '2147483648']) {
    assert.equal((await f.request('PATCH', `/${id}`, { name: 'Luna' })).status, 400);
  }
  assert.equal((await f.request('POST', '', { ...valid, care_notes: 'x'.repeat(600000) })).status, 413);
  assert.equal(f.pets.size, 0);
});

test('pet photos are validated, resized and stored as image data', async (t) => {
  const f = await fixture(t);
  const png = await sharp({ create: { width: 640, height: 480, channels: 3, background: '#365d4d' } }).png().toBuffer();
  const response = await f.request('POST', '', { ...valid, photo_url: `data:image/png;base64,${png.toString('base64')}` });
  assert.equal(response.status, 201);
  const { pet } = await response.json();
  assert.match(pet.photo_url, /^data:image\/jpeg;base64,/);
  const image = await sharp(Buffer.from(pet.photo_url.split(',')[1], 'base64')).metadata();
  assert.equal(image.width, 384);
  assert.equal(image.height, 384);
});

test('missing pets, booking conflicts and database failures return safe errors', async (t) => {
  const f = await fixture(t);
  assert.equal((await f.request('DELETE', '/5')).status, 404);
  const failure = await f.request('POST', '', { ...valid, name: 'Failure' });
  assert.equal(failure.status, 503);
  assert.doesNotMatch(await failure.text(), /secret/);
  await f.request('POST', '', { ...valid, name: 'Booked' });
  const conflict = await f.request('DELETE', '/1');
  assert.equal(conflict.status, 409);
  assert.equal(f.pets.size, 1);
});

test('PostgreSQL queries persist pets and scope every read/update/delete to the session owner', async () => {
  const calls = [];
  const repository = createPetsRepository({ async query(sql, values) {
    calls.push({ sql, values }); return { rows: [{ id: 5 }] };
  } });
  await repository.create(12, { ...valid, name: 'Luna' });
  assert.match(calls[0].sql, /INSERT INTO pets/);
  assert.deepEqual(calls[0].values, [12, 'Luna', 'Dog', null, '2020-02-29', null, valid.photo_url]);
  await repository.findAll(12);
  await repository.update(12, 5, { name: 'Luna II', breed: null });
  await repository.remove(12, 5);
  for (const call of calls.slice(1)) {
    assert.match(call.sql, /WHERE owner_id = \$1/);
    assert.equal(call.values[0], 12);
  }
  assert.deepEqual(calls[2].values, [12, 5, 'Luna II', null]);
  assert.match(calls[2].sql, /AND id = \$2/);
  assert.match(calls[3].sql, /AND id = \$2/);
  assert.match(calls[1].sql, /to_char\(birth_date, 'YYYY-MM-DD'\)/);
});
