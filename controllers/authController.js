const {User, Organisation} = require('../model/user');
const {sequelize} = require('../config/dbConnection');
const jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');
require('dotenv').config()

const jwtSecret = process.env.JWTSECRET;
const maxAge = 1 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({id}, jwtSecret, {
        expiresIn: maxAge
    });
};

module.exports.register = async (req, res) => {
    const {firstName, lastName, email, password, phone} = req.body;
    console.log(req.body)

    try {
        // await sequelize.sync();
        const newUser = await User.create({firstName, lastName, email, password,phone});
        const result = newUser;
        console.log('result:', result.toJSON());
        // Create default organisation
        const newOrganisation = await Organisation.create({ name: `${firstName}'s Organisation`, description: `${firstName}'s Organisation is getting bigger.`, userId: newUser.userId });

        const token = createToken(result)
        console.log('newUser: ', result);
        res.status(201)
        .json({
            status: 'Success',
            message: 'Registration successful',
            data: {
                accessToken: token,
                user: {
                    userId: result.userId,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    phone: result.phone
                }
            }
        });
    } catch (error) {
        console.log('error register; ',error.name , error.message)
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => ({
              field: err.path,
              message: err.message
            }));
            return res.status(422).json({ errors });
          }
        if (error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map(err => ({
            field: err.path,
            message: err.message
          }));
          return res.status(422).json({ errors });
        }
        
        res.status(400).json({
            "status": "Bad request",
            "message": "Registration unsuccessful",
            "statusCode": 400

        });
    } // finally {
    //     await sequelize.close(); // Close the connection
    // }

};

module.exports.login = async (req, res) => {
    const {email, password} = req.body;
    try {
        // Check if email or password is missing
        if (!email || !password) {
            return res.status(422).json({
                status: 'Bad request',
                message: 'Validation failed',
                errors: [
                    { field: !email ? 'email' : 'password', message: 'Email and password are required' }
                ]
            });
        }
        // await sequelize.sync();
        const user = await User.findOne({
            where: { email }
          });
        console.log('usr fnd:', user.toJSON())

        if (!user) {
            return res.status(401).json({
                status: 'Bad request',
                message: 'Authentication failed',
                statusCode: 401
              });
        }
        const result = user.toJSON();
        console.log('user passed')
        console.log(user.password)
        const passwd_auth = await bcrypt.compare(password, user.password);
        if (passwd_auth) {
            const token = createToken(result)
            console.log('User found:', result);
            res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000 });
            res.status(200)
            .json({
                status: 'Success',
                message: 'Login successful',
                data: {
                    accessToken: token,
                    user: {
                        userId: result.userId,
                        firstName: result.firstName,
                        lastName: result.lastName,
                        email: result.email,
                        phone: result.phone
                    }
                }
            });
        } else {
            console.log('User not found')
            res.status(401).json({
                "status": "Bad request",
                "message": "Authentication failed",
                "statusCode": 401
            });
        };
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            status: 'Bad request',
            message: 'Authentication failed',
            statusCode: 401
        });
    } // finally {
    //     await sequelize.close(); // Close the connection
    // }
    
}