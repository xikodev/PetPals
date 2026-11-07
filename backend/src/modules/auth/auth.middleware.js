function requireUser(req, res, next) {
  if (!req.auth?.user) return res.status(401).json({ error: 'Sign in first.' });
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth?.user) return res.status(401).json({ error: 'Sign in first.' });
    if (!roles.includes(req.auth.user.role)) return res.status(403).json({ error: 'Access denied.' });
    next();
  };
}

function requireBookingAccess(req, res, next) {
  const user = req.auth?.user;
  if (!user) return res.status(401).json({ error: 'Sign in first.' });
  if (!['owner', 'helper'].includes(user.role) || user.verification_status !== 'approved'
      || (user.suspended_until && new Date(user.suspended_until).getTime() > Date.now())) {
    return res.status(403).json({ error: 'Booking access requires an approved, unsuspended owner or helper account.' });
  }
  next();
}

module.exports = { requireUser, requireRole, requireBookingAccess };
