function createUsersRepository(db) {
  async function findProfile(userId) {
    const result = await db.query(`SELECT id, first_name, last_name, email,
      photo_url, role, verification_status, suspended_until, created_at
      FROM users WHERE id = $1`, [userId]);
    return result.rows[0] || null;
  }

  async function findPets(ownerId) {
    const result = await db.query(`SELECT id, name, species, breed,
      to_char(birth_date, 'YYYY-MM-DD') AS birth_date,
      care_notes, photo_url FROM pets WHERE owner_id = $1 ORDER BY id DESC`, [ownerId]);
    return result.rows;
  }

  async function findActiveListings(helperId) {
    const result = await db.query(`SELECT listing.id, listing.service_type_id,
      category.name AS service_type, listing.description, listing.rate,
      listing.rate_unit, listing.photo_url, listing.latitude, listing.longitude,
      listing.status
      FROM service_listings AS listing
      JOIN service_types AS category ON category.id = listing.service_type_id
      WHERE listing.helper_id = $1 AND listing.status = 'published'
      ORDER BY listing.id DESC`, [helperId]);
    return result.rows;
  }

  async function updateProfile(userId, fields) {
    // Presence flags distinguish an omitted photo from an explicit null.
    // PostgreSQL evaluates every assignment against the existing row.
    const result = await db.query(`UPDATE users SET
      first_name = CASE WHEN $2 THEN $3 ELSE first_name END,
      last_name = CASE WHEN $4 THEN $5 ELSE last_name END,
      photo_url = CASE WHEN $6 THEN $7 ELSE photo_url END,
      verification_status = CASE WHEN role <> 'administrator' AND
        (($2 AND first_name IS DISTINCT FROM $3) OR ($4 AND last_name IS DISTINCT FROM $5))
        THEN 'pending' ELSE verification_status END,
      reviewed_by = CASE WHEN role <> 'administrator' AND
        (($2 AND first_name IS DISTINCT FROM $3) OR ($4 AND last_name IS DISTINCT FROM $5))
        THEN NULL ELSE reviewed_by END,
      reviewed_at = CASE WHEN role <> 'administrator' AND
        (($2 AND first_name IS DISTINCT FROM $3) OR ($4 AND last_name IS DISTINCT FROM $5))
        THEN NULL ELSE reviewed_at END
      WHERE id = $1
      RETURNING id, first_name, last_name, email, photo_url, role,
        verification_status, suspended_until, created_at`,
    [userId, Object.hasOwn(fields, 'first_name'), fields.first_name ?? null,
      Object.hasOwn(fields, 'last_name'), fields.last_name ?? null,
      Object.hasOwn(fields, 'photo_url'), fields.photo_url ?? null]);
    return result.rows[0] || null;
  }

  return { findProfile, findPets, findActiveListings, updateProfile };
}

module.exports = { createUsersRepository };
