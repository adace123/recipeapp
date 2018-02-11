import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import sequelize from '../db';

const Rating = sequelize.define('rating', {
  ratingid: {
    type: Sequelize.TEXT,
    primaryKey: true,
    defaultValue: uuid(),
  },
  rating: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

module.exports = Rating;
