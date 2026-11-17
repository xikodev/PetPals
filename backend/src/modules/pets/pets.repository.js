const PET_FIELDS = "id, name, species, breed, to_char(birth_date, 'YYYY-MM-DD') AS birth_date, care_notes, photo_url";

function createPetsRepository(db) {
  async function findAll(ownerId) {
    const result = await db.query(`SELECT ${PET_FIELDS} FROM pets WHERE owner_id = $1 ORDER BY id DESC`, [ownerId]);
    return result.rows;
  }

  async function create(ownerId, fields) {
    const result = await db.query(`INSERT INTO pets
      (owner_id, name, species, breed, birth_date, care_notes, photo_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${PET_FIELDS}`,
    [ownerId, fields.name, fields.species, fields.breed ?? null, fields.birth_date, fields.care_notes ?? null, fields.photo_url]);
    return result.rows[0];
  }

  async function update(ownerId, petId, fields) {
    // Keys are allowlisted and values are always parameters.
    const allowed = ['name', 'species', 'breed', 'birth_date', 'care_notes', 'photo_url'];
    const keys = allowed.filter((key) => Object.hasOwn(fields, key));
    if (!keys.length) throw new Error('No pet fields to update.');
    const assignments = keys.map((key, index) => `${key} = $${index + 3}`);
    const result = await db.query(`UPDATE pets SET ${assignments.join(', ')}
      WHERE owner_id = $1 AND id = $2 RETURNING ${PET_FIELDS}`,
    [ownerId, petId, ...keys.map((key) => fields[key])]);
    return result.rows[0] || null;
  }

  async function remove(ownerId, petId) {
    const result = await db.query('DELETE FROM pets WHERE owner_id = $1 AND id = $2 RETURNING id', [ownerId, petId]);
    return result.rows.length > 0;
  }

  return { findAll, create, update, remove };
}

module.exports = { createPetsRepository };
