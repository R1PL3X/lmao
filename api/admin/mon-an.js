const handler = require('../../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["admin", "mon-an"] };
  return handler(req, res);
};

