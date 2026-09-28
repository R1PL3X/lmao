const handler = require('../../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["auth", "register"] };
  return handler(req, res);
};

