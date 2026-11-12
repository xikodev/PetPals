function createUsersController(service) {
  async function getOwnProfile(req, res) {
    // Identity always comes from the server-side session, never the URL/body.
    const result = await service.getOwnProfile(req.auth.user.id);
    if (!result) return res.status(404).json({ error: 'Profile not found.' });
    return res.json(result);
  }

  async function updateOwnProfile(req, res) {
    const profile = await service.updateOwnProfile(req.auth.user.id, req.body);
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    return res.json({ profile });
  }

  return { getOwnProfile, updateOwnProfile };
}

module.exports = { createUsersController };
