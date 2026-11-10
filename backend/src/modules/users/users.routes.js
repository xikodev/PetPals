const { Router } = require('express');
const { requireUser } = require('../auth/auth.middleware');
const { createUsersService } = require('./users.service');
const { createUsersController } = require('./users.controller');

function createUsersRouter({ repository, loadSession }) {
  const router = Router();
  const controller = createUsersController(createUsersService(repository));
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.get('/me', loadSession, requireUser, controller.getOwnProfile);
  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    // Database errors may contain private data or connection information.
    return res.status(503).json({ error: 'Profile is temporarily unavailable. Please try again later.' });
  });
  return router;
}

module.exports = { createUsersRouter };
