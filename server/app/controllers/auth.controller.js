// const config = require("../config/auth.config");
const db = require("../models");
// const User = db.user;
// const Role = db.role;
const { user: User, role: Role, refreshToken: RefreshToken } = db;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    const savedUser = await user.save();

    if (req.body.roles) {
      const roles = await Role.find({
        name: { $in: req.body.roles },
      });

      savedUser.roles = roles.map((role) => role._id);
      await savedUser.save();

      res.send({ message: "User was registered successfully!" });
    } else {
      const role = await Role.findOne({ name: "user" });
      savedUser.roles = [role._id];
      await savedUser.save();

      res.send({ message: "User was registered successfully!" });
    }
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    }).populate("roles", "-__v");

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    //   algorithm: "HS256",
    //   allowInsecureKeySizes: true,
    //   expiresIn: 86400, // 24 hours
    // });

    // console.log("process.env.JWT_EXPIRATION:", process.env.JWT_EXPIRATION);

    let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    let refreshToken = await RefreshToken.createToken(user);

    var authorities = [];
    for (let i = 0; i < user.roles.length; i++) {
      authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
    }

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
      refreshToken: refreshToken,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  // console.log("requestToken:", requestToken);

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });
    // console.log("refreshToken:", refreshToken);

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    // console.log("refreshToken:", refreshToken);
    // console.log("refreshToken.token:", refreshToken.token);

    // console.log(
    //   "RefreshToken.verifyExpiration(refreshToken):",
    //   RefreshToken.verifyExpiration(refreshToken)
    // );

    if (RefreshToken.verifyExpiration(refreshToken)) {
      // console.log("entered in RefreshToken.verifyExpiration(refreshToken)");

      // RefreshToken.findByIdAndRemove(refreshToken._id, {
      //   useFindAndModify: false,
      // }).exec();

      RefreshToken.findByIdAndDelete(refreshToken._id).exec();

      res.status(403).json({
        message: "Refresh token has expired. Please make a new signin request",
      });

      return;
    }

    let newAccessToken = jwt.sign(
      { id: refreshToken.user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRATION,
      }
    );

    // console.log("newAccessToken:", newAccessToken);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    // console.log("entered in catch block");
    return res.status(500).send({ message: err });
  }
};
