const { normalizePhoto } = require('../users/users.photo');

async function petFields(body, partial = false) {
  const invalid = (message) => { throw Object.assign(new Error(message), { status: 400 }); };
  const allowed = ['name', 'species', 'breed', 'birth_date', 'care_notes', 'photo_url'];
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('Provide a JSON object.');
  const keys = Object.keys(body);
  if (!keys.length || keys.some((key) => !allowed.includes(key))) invalid('Provide only pet details; ownership cannot be changed.');
  if (!partial && ['name', 'species', 'birth_date', 'photo_url'].some((key) => !Object.hasOwn(body, key))) {
    invalid('Name, species, birth date and a photo are required.');
  }
  const fields = {};
  for (const key of keys) {
    const value = body[key];
    if (['name', 'species', 'breed', 'care_notes'].includes(key)) {
      const optional = ['breed', 'care_notes'].includes(key);
      if (optional && value === null) { fields[key] = null; continue; }
      const max = key === 'care_notes' ? 1000 : 100;
      if (typeof value !== 'string' || value.trim().length > max || (!optional && !value.trim())) {
        invalid(`${key} must contain ${optional ? 'up to' : 'between 1 and'} ${max} characters.`);
      }
      fields[key] = value.trim() || null;
    } else if (key === 'birth_date') {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid('Provide a valid birth date.');
      const date = new Date(`${value}T00:00:00Z`);
      if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value
          || value < '0001-01-01' || value > new Date().toISOString().slice(0, 10)) {
        invalid('Birth date must be a valid date that is not in the future.');
      }
      fields[key] = value;
    } else {
      if (typeof value === 'string' && value.startsWith('data:')) {
        fields[key] = await normalizePhoto(value);
      } else {
        let url;
        try { url = new URL(value); } catch { invalid('A valid photo is required.'); }
        if (typeof value !== 'string' || value.length > 2048 || url.protocol !== 'https:' || url.username || url.password) {
          invalid('Choose a photo or provide an HTTPS photo URL.');
        }
        fields[key] = url.href;
      }
    }
  }
  return fields;
}

module.exports = { petFields };
