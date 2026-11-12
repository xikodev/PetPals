const { randomBytes, createHash, timingSafeEqual } = require('node:crypto');

const randomToken = () => randomBytes(32).toString('base64url');
const hashToken = (value) => createHash('sha256').update(value).digest('hex');
const pkceChallenge = (value) => createHash('sha256').update(value).digest('base64url');

function equalSecret(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function readCookie(header, name) {
  const entries = (header || '').split(';').map((part) => part.trim());
  const matches = entries.filter((part) => part.startsWith(`${name}=`));
  if (matches.length !== 1) return null;
  const token = matches[0].slice(name.length + 1);
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
}

function registrationFields(body) {
  const firstName = typeof body?.first_name === 'string' ? body.first_name.trim() : '';
  const lastName = typeof body?.last_name === 'string' ? body.last_name.trim() : '';
  if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100
      || !['owner', 'helper'].includes(body?.role)) {
    const error = new Error('Enter first and last names (up to 100 characters) and choose owner or helper.');
    error.status = 400;
    throw error;
  }
  return { firstName, lastName, role: body.role };
}

module.exports = { randomToken, hashToken, pkceChallenge, equalSecret, readCookie, registrationFields };
