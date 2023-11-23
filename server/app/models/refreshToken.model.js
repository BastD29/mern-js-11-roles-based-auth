const mongoose = require("mongoose");
// const config = require("../config/auth.config");
const { v4: uuidv4 } = require("uuid");

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expiryDate: Date,
});

RefreshTokenSchema.statics.createToken = async function (user) {
  // let expiredAt = new Date();
  let now = new Date();
  // console.log("now:", now);
  // console.log("now.getTime():", now.getTime());

  let expiredAt = new Date(
    now.getTime() + Number(process.env.JWT_REFRESH_EXPIRATION)
  );

  // console.log("expiredAt:", expiredAt);

  // console.log(
  //   "process.env.JWT_REFRESH_EXPIRATION:",
  //   process.env.JWT_REFRESH_EXPIRATION
  // );

  // * Token expiry calculation
  // expiredAt.setSeconds(
  //   expiredAt.getSeconds() + process.env.JWT_REFRESH_EXPIRATION
  // );

  // console.log("expiredAt:", expiredAt);

  let _token = uuidv4();

  let _object = new this({
    token: _token,
    user: user._id,
    expiryDate: expiredAt.getTime(),
  });

  // console.log(_object);

  let refreshToken = await _object.save();

  return refreshToken.token;
};

// * Token expiry verification
RefreshTokenSchema.statics.verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
};

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

module.exports = RefreshToken;
