const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey =process.env.JWTSECRET;

const authenticateToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({
      status: 'Bad request',
      message: 'No token provided',
      statusCode: 401
    });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'Bad request',
        message: 'Invalid token',
        statusCode: 403
      });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;