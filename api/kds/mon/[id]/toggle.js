const handler = require('../../../../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["kds","mon",String(req.query.id),"toggle"] };
  return handler(req, res);
};
