const Sequelize = require('sequelize')
const pg = require('pg');
require ('dotenv').config();


const {
POSTGRES_URI
} = process.env

// i added dialectModule to the sequelize function to resolve deployment issues
module.exports.sequelize = new Sequelize(POSTGRES_URI, {
    dialectModule: pg
  });


