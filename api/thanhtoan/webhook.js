const handler = require('../../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["thanhtoan", "webhook"] };
  return handler(req, res);
};

