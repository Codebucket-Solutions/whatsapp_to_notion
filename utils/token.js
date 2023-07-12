const jwt = require("jsonwebtoken");
const users = require("../helper/users");

const { USER } = users;

module.exports = function (id, userType = USER) {
  const token = jwt.sign({ userId: id, userType }, process.env.JWT_PRIVATE_KEY);
  return token;
};
