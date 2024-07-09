const Sequelize = require('sequelize')
require ('dotenv').config();


const {
POSTGRES_URI
} = process.env

module.exports.sequelize = new Sequelize(POSTGRES_URI);


