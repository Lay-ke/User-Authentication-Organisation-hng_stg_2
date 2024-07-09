const {Router} = require('express');
const userController = require('../controllers/userController')
const authenticateToken = require('../middleware/authmiddleware')


const router = Router();

const baseUrl = '/api'

router.get(`${baseUrl}/users/:id`, userController.getUser);

router.get(`${baseUrl}/organisations`, authenticateToken, userController.getUserOrganisations);
router.post(`${baseUrl}/organisations`, authenticateToken, userController.createUserOrganisations);

router.get(`${baseUrl}/organisations/:orgid`,authenticateToken ,userController.getUserOrganisation);
router.post(`${baseUrl}/organisations/:orgid/users`,authenticateToken ,userController.addUser2Organisation);

module.exports = router;
