const { Router, json } = require('express');
const { requireRole } = require('../auth/auth.middleware');
const { petFields } = require('./pets.service');

function createPetsRouter({ repository, loadSession, csrf }) {
  const router = Router();
  router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  // Pending owners can prepare profiles and pets before approval for bookings.
  router.use(loadSession, requireRole('owner'));
  router.param('id', (req, res, next, value) => {
    if (!/^[1-9]\d*$/.test(value) || Number(value) > 2147483647) {
      return res.status(400).json({ error: 'Invalid pet ID.' });
    }
    next();
  });
  router.get('/', async (req, res) => {
    res.json({ pets: await repository.findAll(req.auth.user.id) });
  });
  router.post('/', csrf, json({ limit: '512kb' }), async (req, res) => {
    const fields = await petFields(req.body);
    const pet = await repository.create(req.auth.user.id, fields);
    res.status(201).json({ pet });
  });
  router.patch('/:id', csrf, json({ limit: '512kb' }), async (req, res) => {
    const fields = await petFields(req.body, true);
    const pet = await repository.update(req.auth.user.id, Number(req.params.id), fields);
    if (!pet) return res.status(404).json({ error: 'Pet not found.' });
    res.json({ pet });
  });
  router.delete('/:id', csrf, async (req, res) => {
    if (!await repository.remove(req.auth.user.id, Number(req.params.id))) {
      return res.status(404).json({ error: 'Pet not found.' });
    }
    res.status(204).end();
  });
  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.status === 413) return res.status(413).json({ error: 'Photo upload is too large.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Provide valid JSON.' });
    if (error.status === 400) return res.status(400).json({ error: error.message });
    if (error.code === '23503' && req.method === 'DELETE') {
      return res.status(409).json({ error: 'This pet is linked to a booking and cannot be deleted.' });
    }
    res.status(503).json({ error: 'Pets are temporarily unavailable. Please try again later.' });
  });
  return router;
}

module.exports = { createPetsRouter };
