const { User, Organisation } = require("../model/user");
const jwt = require('jsonwebtoken');
require('dotenv').config()

const jwtSecret = process.env.JWTSECRET;
const maxAge = 1 * 24 * 60 * 60 

// const createToken = (id) => {
//     return jwt.sign({id}, jwtSecret, {
//         expiresIn: maxAge
//     });
// };

module.exports.getUser = async (req, res) => {
    const id = req.params.id;
    console.log('ID:', id);
    try {
        const user = await User.findByPk(id);
        if (!user){
            res.status(400).json({message: 'User not found'});
        };
        const result = user;
        res.status(200)
        .json({
            status: 'success',
            message: 'User found',
            data: {
                userId: result.userId,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                phone: result.phone
            }
        });
    } catch (error) {
        console.log('error:', error.message);
        res.status(400).json({
            status: 'Bad request',
            message: 'Failed to retrieve user',
            statusCode: 400
          });
    }
    
};

module.exports.getUserOrganisations = async (req, res) => {
    try {
        const {userId}  = req.user.id; // Assuming userId is available in req.user after authentication
        console.log(userId)
        const organisations = await Organisation.findAll({
        where: { userId }
        });
        

        console.log('orgs: ', organisations)
        const orgs = organisations;
        res.status(200)
        .json({
            status: 'success',
            message: 'User Organisations',
            data: {
                organisations: orgs
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'Bad request',
            message: 'Failed to retrieve organisations',
            statusCode: 400
          });
    }
    
};

module.exports.getUserOrganisation = async (req, res) => {
    const orgId = req.params.orgid;
    const { userId } = req.user.id;

    try {
        const organisation = await Organisation.findByPk(orgId);

        if (!organisation || organisation.userId !== userId) {
            return res.status(404).json({
              status: 'Bad request',
              message: 'Organisation not found',
              statusCode: 404
            });
        }

        const org = organisation;
        res.status(200)
        .json({
            status: 'success',
            message: 'User Organisation',
            data: {
                    orgId: org.orgId,
                    name: org.name,
                    description: org.description
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'Bad request',
            message: 'Failed to retrieve organisation',
            statusCode: 400
          });
    }
    
};

module.exports.createUserOrganisations = async (req, res) => {
    const { name, description } = req.body;
    const { userId } = req.user.id; // Assuming userId is available in req.user after authentication
    try {
        const newOrganisation = await Organisation.create({ name, description, userId });
        const newOrg = newOrganisation;
        console.log('created: ', newOrg)

        res.status(201)
        .json({
            status: 'success',
            message: 'Organisation created successfully',
            data: {
                    orgId: newOrg.orgId,
                    name: newOrg.name,
                    description: newOrg.description
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Client error',
            statusCode: 400
          });
    }
};

module.exports.addUser2Organisation = async (req, res) => {
    const orgId  = req.params.orgid;
    const { userId } = req.body;
    console.log('orgid', orgId)
    console.log('userid', userId)
    try {
        const organisation = await Organisation.findByPk(orgId);
        

        if (!organisation) {
            return res.status(404).json({
                status: 'Bad request',
                message: 'Organisation not found',
                statusCode: 404
            });
        }
        console.log('org passed')
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                status: 'Bad request',
                message: 'User not found',
                statusCode: 404
            });
        };
        console.log(user.toJSON())
        await organisation.addUser(user); 
        res.status(200)
        .json({
                status: 'success',
                message: 'User added to organisation successfully'
        });
        
    } catch (error) {
        console.log(error.message)
        res.status(400).json({
            status: 'Bad request',
            message: 'Failed to add user to organisation',
            statusCode: 400
          });
    }
    
};