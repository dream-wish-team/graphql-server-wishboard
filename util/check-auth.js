const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');
const { SECRET_KEY_ACCESS } = require('../config');

module.exports = (context) => {
  const accessToken = context.req.cookies['access'];
  console.log('check-auth accessToken', accessToken);
  if (accessToken) {
    try {
      const { user } = jwt.verify(accessToken, SECRET_KEY_ACCESS);
      return user;
    } catch (err) {
      throw new AuthenticationError('Invalid/Expired token');
    }
  }

  throw new Error('Authorization header must be provided');
};
