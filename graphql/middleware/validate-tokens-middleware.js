const {
  validateAccessToken,
  validateRefreshToken,
} = require('../../util/validators');
const User = require('../../models/User');
const { setTokens, tokenCookies } = require('../../util/set-tokens');

module.exports = async function validateTokensMiddleware(req, res, next) {
  const refreshToken = req.cookies['refresh'];
  const accessToken = req.cookies['access'];
  console.log('validateTokensMiddleware accessToken', accessToken);
  if (!accessToken && !refreshToken) return next();
  const decodedAccessToken = validateAccessToken(accessToken);
  if (decodedAccessToken && decodedAccessToken.user) {
    req.user = decodedAccessToken.user;
    return next();
  }
  const decodedRefreshToken = validateRefreshToken(refreshToken);
  if (decodedRefreshToken && decodedRefreshToken.user) {
    const user = await User.findById(decodedRefreshToken.user.id);
    if (!user || user.tokenCount !== decodedRefreshToken.user.count) {
      res.clearCookie('access');
      res.clearCookie('refresh');
      return next();
    }
    const userTokens = setTokens(user);
    req.user = decodedRefreshToken.user;
    const cookies = tokenCookies(userTokens);
    res.cookie(...cookies.access);
    res.cookie(...cookies.refresh);
    return next();
  }
  next();
};
