import bcrypt from "bcrypt";
import passport from "passport";
import FacebookStrategy from "passport-facebook";
import GoogleStrategy from "passport-google-oauth20";
import localStrategy from "passport-local";
import User from "../model/userModel.js";

const LocalStrategy = localStrategy.Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env["FACEBOOK_CLIENT_ID"],
      clientSecret: process.env["FACEBOOK_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/facebook",
      state: true,
      profileFields: ["id", "displayName", "photos", "email", "gender", "name"],
    },
    async function verify(accessToken, refreshToken, profile, done) {
      const profileImage = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&access_token=${accessToken}`;
      //Check the DB to find a User with the profile.id
      try {
        let user = await User.findOne({
          provider: "facebook",
          provider_id: profile.id,
        });
        if (user) {
          return done(null, user);
        } else {
          let user = await User.create({
            provider_id: profile.id, //pass in the id and displayName params from Facebook
            username: profile.displayName,
            provider: "facebook",
            profile_image: profileImage || "",
            email: profile.emails[0].value,
          });

          return done(null, user);
        }
      } catch (error) {
        console.log(error); // handle errors!
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile", "email"],
      state: true,
    },
    async function verify(accessToken, refreshToken, profile, done) {
      //Check the DB to find a User with the profile.id
      try {
        const user = await User.findOne({
          provider: "google",
          provider_id: profile.id,
        });
        if (user) {
          return done(null, user);
        } else {
          const user = await User.create({
            provider: "google",
            provider_id: profile.id, //pass in the id and displayName params from google
            username: profile.displayName,
            profile_image: profile.photos[0].value || "",
            email: profile.emails[0].value,
          });
          return done(null, user);
        }
      } catch (error) {
        console.log(error); // handle errors!
        return done(error);
      }
    }
  )
);

//local strategy
passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    await User.findOne({ username: username })
      .then((user) => {
        if (!user)
          return done(null, false, {
            message: "No user found with the given username",
          });
        if (bcrypt.compareSync(password, user.password)) {
          return done(null, user);
        } else
          return done(null, false, {
            message: "Username and Password did not match",
          });
      })
      .catch((err) => {
        done(err);
      });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => done(err));
});
