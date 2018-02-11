import bcrypt from 'bcrypt';
import express from 'express';
import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Op } from 'sequelize';
import { ExtractJwt, Strategy } from 'passport-jwt';
import User from '../../db/models/User';

const router = express.Router();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'keyboard cat',
};

passport.use(new Strategy(jwtOptions, (payload) => {
  console.log(payload);
  // Recipe.find({where: {userid: payload.user.userid, recipeid: payload.user.recipeid}})
  // .then(recipe => {
  //     if(recipe)
  //     next(null, recipe);

  //     else next(null, false);
  // });
}));


// use auth middleware to protect routes
router.get('/users/:id', (req, res) => {
  User.find({ where: { userid: req.params.id }, attributes: ['userid', 'email', 'username'] })
    .then(user => res.status(200).json(user));
});

router.post('/login', (req, res) => {
  if (req.body.token) {
    return res.status(200).json({ message: 'Already logged in' });
  }

  return User.find({ where: { email: req.body.email } })
    .then((user) => {
      if (!user || !bcrypt.compareSync(req.body.password, user.password)) { return res.status(401).json({ error: 'Invalid email or password' }); }

      const token = jwt.sign({ user }, jwtOptions.secretOrKey);
      return res.status(200).json({ user, token, isAdmin: user.isAdmin() });
    });
});

router.post('/logout', (req, res) => {
  if (!req.body.token) {
    return res.status(400).json({ message: 'Must be signed in to logout.' });
  }
  return res.status(200).json({ message: 'Successfully logged out' });
});

router.post('/register', (req, res) => {
  User.find({ where: { [Op.or]: [{ email: req.body.email }, { username: req.body.username }] } })
    .then((user) => {
      if (user) {
        return res.status(400).json({ message: 'Account already exists' });
      }

      const newUser = {
        userid: uuid(),
        email: req.body.email,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
      };
      const token = jwt.sign({ userid: req.body.userid }, jwtOptions.secretOrKey);
      return User.create(newUser).then(createdUser => res.status(200)
        .json({ user: createdUser, token, isAdmin: createdUser.isAdmin() }));
    });
});

export default router;
