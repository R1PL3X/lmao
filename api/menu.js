const handler = require("./[...path]");

module.exports = async (req, res) => {
  req.query = {
    ...(req.query || {}),
    path: ["menu"],
  };

  return handler(req, res);
};
