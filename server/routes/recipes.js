import express from 'express';
import Recipe from '../db/models/Recipe';
import Rating from '../db/models/Rating';

const router = express.Router();

const uuid = require('uuid/v4');
const db = require('../db/db');
const { isLoggedIn, isAuthorized } = require('../middleware/authMiddleware');

router.get('/all', (req, res) => 
  Recipe.findAll({ order: [['createdAt', 'DESC']] })
    .then(recipes => Rating.findAll({ order: [['createdAt', 'DESC']] })
    .then(ratings => res.status(200).json({ recipes, ratings })))
    .catch(err => res.status(500).json({ err })));

router.get('/:id', (req, res) => 
  Recipe.find({ where: { recipeid: req.params.id } })
    .then(recipe => res.status(200).json(recipe))
    .catch(err => res.status(500).json({ err })));

router.delete('/:id', isAuthorized, (req, res) => 
  Recipe.destroy({ where: { recipeid: req.params.id } })
    .then((row) => {
      if (row === 1) {
        return res.status(200).json({ message: 'Recipe successfully deleted' });
      }
      return res.status(500).json({ message: 'Something went wrong.' });
    })
    .catch(err => res.status(500).json(err)));

router.post('/new', isLoggedIn, (req, res) => {
  const { recipe } = req.body;
  const rating = {
    ratingid: uuid(),
    userid: recipe.userid,
    recipeid: recipe.recipeid,
    rating: 0,
  };
  return Recipe.findCreateFind({ where: recipe })
    .then((r) => {
      Rating.create(rating).then(() => res.status(200).json({ recipe: r }));
    });
});

router.get('/ratings/:recipeid/', (req, res) => 
  db.query('SELECT AVG(rating) FROM ratings WHERE recipeid = $recipeid', { bind: { recipeid: req.params.recipeid } })
    .then(avg => res.status(200).json(avg))
    .catch(err => res.status(404).json({ error: err })));

router.post('/ratings', isLoggedIn, (req, res) => {
  const searchParams = {
    ratingid: uuid(), recipeid: req.body.recipeid, userid: req.body.userid, rating: req.body.rating,
  };
  return Rating.create(searchParams)
    .then((rating) => {
      res.status(200).json({ rating });
    })
    .catch(() => {
      res.status(500).json({ error: 'Error. Rating could not be added. ' });
    });
});

router.put('/ratings', isLoggedIn, (req, res) => {
  const searchParams = { recipeid: req.body.recipeid, userid: req.body.userid };
  return Rating.find({ where: searchParams })
    .then((rating) => {
      if (rating) {
        return Rating.update({ rating: req.body.rating }, { where: searchParams })
          .then((updatedRating) => {
            res.status(200).json({ updatedRating });
          }).catch(err => console.log(err));
      }
      return res.status(404).json({ error: 'Recipe not found' });
    })
    .catch(err => res.status(404).json({ error: err }));
});

router.put('/:id', isAuthorized, (req, res) => 
  db.query(
    `UPDATE recipes SET ${req.body.field} = $value WHERE recipeid = $recipeid`
    , { bind: { value: req.body.value, recipeid: req.params.id } },
  )
    .then(() => {
      Recipe.find({ where: { recipeid: req.params.id } })
        .then((recipe) => {
          res.status(200).send(recipe);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Could not update recipe' });
    }));

export default router;
