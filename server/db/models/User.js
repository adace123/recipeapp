import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../db';
import Rating from './Rating';

const User = sequelize.define('user', {
  userid: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  email: {
    allowNull: false,
    type: Sequelize.STRING,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    allowNull: false,
    unique: true,
    type: Sequelize.STRING,
  },
  password: {
    allowNull: false,
    type: Sequelize.STRING,
  },
});


User.prototype.isAdmin = function () {
  return process.env.ADMIN_EMAIL === this.email && process.env.ADMIN_PASSWORD === this.password;
};

User.prototype.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

User.hasMany(Rating, {
  foreignKey: 'userid',
});

module.exports = User;
