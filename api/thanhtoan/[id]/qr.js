const handler = require('../../../lib/api-handler');

module.exports = async (req, res) => {
  req.query = { ...(req.query || {}), path: ["thanhtoan",String(req.query.id),"qr"] };
  return handler(req, res);
};
