const handler = require('../../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["donhang", "cua-toi"] };
  return handler(req, res);
};

