import passport from "passport";
import passportJWT from "passport-jwt";
import User from "../model/userModel.js";

const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;

const params = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

export default function () {
  const strategy = new Strategy(params, async function (payload, done) {
    try {
      if (payload.expire <= Date.now()) {
        return done(new Error("TokenExpired"), null);
      }
      const user = await User.findById(payload.id);
      return done(null, user);
    } catch (error) {
      return done(new Error("UserNotFound"), null);
    }
  });

  passport.use(strategy);

  return {
    initialize: function () {
      return passport.initialize();
    },
  };
}
