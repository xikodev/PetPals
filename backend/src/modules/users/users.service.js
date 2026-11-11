function createUsersService(repository) {
  async function getOwnProfile(userId) {
    const profile = await repository.findProfile(userId);
    if (!profile) return null;

    const pets = profile.role === 'owner' ? await repository.findPets(userId) : [];
    const activeListings = profile.role === 'helper' ? await repository.findActiveListings(userId) : [];
    return { profile, pets, active_listings: activeListings };
  }

  async function updateOwnProfile(userId, body) {
    const invalid = (message) => { throw Object.assign(new Error(message), { status: 400 }); };
    if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('Provide a JSON object.');
    const keys = Object.keys(body);
    const allowed = ['first_name', 'last_name', 'photo_url'];
    if (!keys.length || keys.some((key) => !allowed.includes(key))) {
      invalid('Provide only first_name, last_name or photo_url, with at least one field.');
    }
    const fields = {};
    for (const key of keys) {
      const value = body[key];
      if (key !== 'photo_url') {
        if (typeof value !== 'string' || !value.trim() || value.trim().length > 100) {
          invalid(`${key} must contain between 1 and 100 characters.`);
        }
        fields[key] = value.trim();
      } else {
        if (value === null) { fields[key] = null; continue; }
        if (typeof value !== 'string' || value.length > 2048) invalid('photo_url must be an HTTPS URL or null.');
        let url;
        try { url = new URL(value); } catch { invalid('photo_url must be an HTTPS URL or null.'); }
        if (url.protocol !== 'https:' || url.username || url.password) invalid('photo_url must be an HTTPS URL or null.');
        fields[key] = url.href;
      }
    }
    return repository.updateProfile(userId, fields);
  }

  return { getOwnProfile, updateOwnProfile };
}

module.exports = { createUsersService };
