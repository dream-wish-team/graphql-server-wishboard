const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');
const { SECRET_KEY_REFRESH } = require('../config');

module.exports = (context) => {
  const refreshToken = context.req.cookies['refresh'];
  if (refreshToken) {
    try {
      const { user } = jwt.verify(refreshToken, SECRET_KEY_REFRESH);
      return user;
    } catch (err) {
      throw new AuthenticationError('Invalid/Expired token');
    }
  }

  throw new Error('Authorization header must be provided');
};
