const handler = require('../../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["auth", "forgot-password"] };
  return handler(req, res);
};

