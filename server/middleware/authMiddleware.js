import jwt from 'jsonwebtoken';

module.exports = {
  isAdmin: (req, res, next) => {
    const validEmail = req.session.user.email === process.env.ADMIN_EMAIL;
    const validPassword = req.session.user.password === process.env.ADMIN_PASSWORD;
    if (validEmail && validPassword) {
      return next();
    }

    return res.status(403).json({ err: 'Not authorized.' });
  },
  isLoggedIn: (req, res, next) => {
    if (req.body.token) {
      return next();
    }
    return res.status(403).json({ err: 'Must be logged in.' });
  },
  isAuthorized: (req, res, next) => {
    if (!req.body.token) { return res.status(401).json({ err: 'Forbidden: Token not present' }); }

    return jwt.verify(req.body.token, 'keyboard cat', (err) => {
      if (err) { return res.status(401).json({ err: 'Forbidden: Unauthorized user' }); }

      return next();
    });
  },
};
