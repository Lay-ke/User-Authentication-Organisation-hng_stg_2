const Sequelize = require('sequelize')
require ('dotenv').config();


const {
POSTGRES_HOST,
POSTGRES_DB,
POSTGRES_USER,
POSTGRES_PASSWORD,
POSTGRES_URI
} = process.env

module.exports.sequelize = new Sequelize(POSTGRES_URI);


