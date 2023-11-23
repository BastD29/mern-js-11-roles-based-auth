const jwt = require("jsonwebtoken");
// const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(401)
      .send({ message: "Unauthorized! Access token has expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
};

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  // jwt.verify(token, config.secret, (err, decoded) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // if (err) {
    //   return res.status(401).send({
    //     message: "Unauthorized!",
    //   });
    // }

    if (err) return catchError(err, res);

    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).exec();

    const roles = await Role.find({
      _id: { $in: user.roles },
    }).exec();

    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }

    res.status(403).send({ message: "Require Admin Role!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

isModerator = (req, res, next) => {
  User.findById(req.userId)
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      Role.find({ _id: { $in: user.roles } })
        .then((roles) => {
          for (let i = 0; i < roles.length; i++) {
            if (roles[i].name === "moderator") {
              next();
              return;
            }
          }

          res.status(403).send({ message: "Require Moderator Role!" });
        })
        .catch((err) => res.status(500).send({ message: err }));
    })
    .catch((err) => res.status(500).send({ message: err }));
};

const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
};
module.exports = authJwt;
