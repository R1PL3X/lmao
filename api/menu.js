const handler = require('../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["menu"] };
  return handler(req, res);
};

