require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.HEROKU_DB_URL, {
  dialect: 'postgres',
  logging: false,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database: ', err);
  });

// sequelize.sync({ force: true });

export default sequelize;
