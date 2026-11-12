const { randomToken, hashToken } = require('./auth.security');

const USER_FIELDS = 'id, first_name, last_name, email, photo_url, role, verification_status, suspended_until';

function createAuthRepository(db) {
  async function createSession(purpose, data, userId = null, client = db) {
    const token = randomToken();
    const idleSeconds = purpose === 'authenticated' ? 1800 : 600;
    const absoluteSeconds = purpose === 'authenticated' ? 43200 : 600;
    await client.query(`INSERT INTO auth_sessions
      (token_hash, purpose, user_id, data, expires_at, absolute_expires_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + $5 * INTERVAL '1 second',
        CURRENT_TIMESTAMP + $6 * INTERVAL '1 second')`,
    [hashToken(token), purpose, userId, JSON.stringify(data), idleSeconds, absoluteSeconds]);
    return { token, maxAge: idleSeconds * 1000 };
  }

  async function findSession(token) {
    if (!token) return null;
    const result = await db.query(`SELECT * FROM auth_sessions
      WHERE token_hash = $1 AND expires_at > CURRENT_TIMESTAMP
      AND absolute_expires_at > CURRENT_TIMESTAMP`, [hashToken(token)]);
    return result.rows[0] || null;
  }

  async function touchSession(token) {
    await db.query(`UPDATE auth_sessions SET expires_at = LEAST(
      CURRENT_TIMESTAMP + INTERVAL '30 minutes', absolute_expires_at)
      WHERE token_hash = $1 AND purpose = 'authenticated'
      AND expires_at > CURRENT_TIMESTAMP AND absolute_expires_at > CURRENT_TIMESTAMP`, [hashToken(token)]);
  }

  async function destroySession(token) {
    if (token) await db.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hashToken(token)]);
  }

  async function consumeOauth(token) {
    const result = await db.query(`DELETE FROM auth_sessions WHERE token_hash = $1
      AND purpose = 'oauth' AND expires_at > CURRENT_TIMESTAMP RETURNING data`, [hashToken(token)]);
    return result.rows[0]?.data || null;
  }

  async function findUserBySubject(subject) {
    const result = await db.query(`SELECT ${USER_FIELDS} FROM users WHERE google_subject = $1`, [subject]);
    return result.rows[0] || null;
  }

  async function findUserById(id) {
    const result = await db.query(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async function register(token, fields) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      // Delete is transactional: concurrent submissions cannot reuse onboarding.
      const pending = await client.query(`DELETE FROM auth_sessions WHERE token_hash = $1
        AND purpose = 'registration' AND expires_at > CURRENT_TIMESTAMP RETURNING data`, [hashToken(token)]);
      if (!pending.rows[0]) {
        const error = new Error('Registration expired. Sign in again.');
        error.status = 401;
        throw error;
      }
      const identity = pending.rows[0].data.identity;
      const inserted = await client.query(`INSERT INTO users
        (first_name, last_name, email, photo_url, role, google_subject, verification_status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        ON CONFLICT (google_subject) DO NOTHING RETURNING ${USER_FIELDS}`,
      [fields.firstName, fields.lastName, identity.email, identity.photoUrl, fields.role, identity.subject]);
      // Parallel registration never overwrites an existing role or approval.
      const user = inserted.rows[0] || (await client.query(
        `SELECT ${USER_FIELDS} FROM users WHERE google_subject = $1`, [identity.subject])).rows[0];
      const session = await createSession('authenticated', { csrf: randomToken() }, user.id, client);
      await client.query('COMMIT');
      return { user, session };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function deleteExpiredSessions() {
    await db.query('DELETE FROM auth_sessions WHERE expires_at <= CURRENT_TIMESTAMP');
  }

  return { createSession, findSession, touchSession, destroySession, consumeOauth,
    findUserBySubject, findUserById, register, deleteExpiredSessions };
}

module.exports = { createAuthRepository };
