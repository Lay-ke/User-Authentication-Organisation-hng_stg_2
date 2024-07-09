const express = require('express');
require('dotenv').config();
const authRoute = require('./routes/authroutes');
const userRoute = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');
const {sequelize} = require('./config/dbConnection')

const app = express();

const port = process.env.PORT;

// middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(authRoute);
app.use(userRoute);
app.use(errorHandler);

app.listen(port, console.log('Listening on port', port));
sequelize.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
})
.catch(err => {console.error('Unable to connect to the database:', err);});



module.exports = app;