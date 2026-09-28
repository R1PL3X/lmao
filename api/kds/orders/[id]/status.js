const handler = require('../../../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["kds","orders",String(req.query.id),"status"] };
  return handler(req, res);
};
