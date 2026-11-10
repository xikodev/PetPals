function createUsersService(repository) {
  async function getOwnProfile(userId) {
    const profile = await repository.findProfile(userId);
    if (!profile) return null;

    const pets = profile.role === 'owner' ? await repository.findPets(userId) : [];
    const activeListings = profile.role === 'helper' ? await repository.findActiveListings(userId) : [];
    return { profile, pets, active_listings: activeListings };
  }

  return { getOwnProfile };
}

module.exports = { createUsersService };
