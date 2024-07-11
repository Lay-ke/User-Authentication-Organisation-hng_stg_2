const {Router} = require('express');
const authController = require('../controllers/authController');

const router = Router();

const baseUrl= '/auth'
router.post(`${baseUrl}/register`, authController.register);

router.post(`${baseUrl}/login`, authController.login);

module.exports = router;