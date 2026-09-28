const handler = require("../[...path].js");

module.exports = async (req, res) => {
  req.query = {
    ...(req.query || {}),
    path: ["auth", "login"],
  };

  return handler(req, res);
};
