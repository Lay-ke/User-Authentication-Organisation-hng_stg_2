const Sequelize = require('sequelize')
const pg = require('pg');
require ('dotenv').config();


const {
POSTGRES_URI
} = process.env

module.exports.sequelize = new Sequelize(POSTGRES_URI, {
    dialectModule: pg
  });


