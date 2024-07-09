const { validationResult, body } = require('express-validator');


const validateRegistration = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.param,
                message: error.msg
            }));
            return res.status(422).json({ errors: formattedErrors });
        }
        next();
    }
];

module.exports = validateRegistration;