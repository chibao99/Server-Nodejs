const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // lay token tu header
  const token = req.header("x-auth-token");
  // kiem tra token co ton tai hay khong
  if (!token) {
    return res.status(401).json({ msg: "Token khong dung" });
  }
  //Xac nhan token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token khong dung" });
  }
};
