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

  return { findProfile, findPets, findActiveListings };
}

module.exports = { createUsersRepository };
