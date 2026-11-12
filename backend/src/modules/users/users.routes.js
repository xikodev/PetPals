const { Router } = require('express');
const { requireUser } = require('../auth/auth.middleware');
const { createUsersService } = require('./users.service');
const { createUsersController } = require('./users.controller');

function createUsersRouter({ repository, loadSession, csrf }) {
  const router = Router();
  const controller = createUsersController(createUsersService(repository));
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.get('/me', loadSession, requireUser, controller.getOwnProfile);
  router.patch('/me', loadSession, requireUser, csrf, controller.updateOwnProfile);
  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.status === 400) return res.status(400).json({ error: error.message });
    // Database errors may contain private data or connection information.
    return res.status(503).json({ error: 'Profile is temporarily unavailable. Please try again later.' });
  });
  return router;
}

module.exports = { createUsersRouter };
