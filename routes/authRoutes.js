import { Router } from "express";
import jwt from "jwt-simple";
import passport from "passport";
import { register } from "../controller/authController.js";

const router = Router();

//logout
router.post("/logout", function (req, res) {
  res.app.set("user", "");
  res.json({ message: "logged out successfully" });
});

//call this endpoint from the frontend to using useEffect to check if login is successful or not
router.get("/auth/success", (req, res) => {
  const user = req.app.get("user");
  if (!user) {
    return res.status(401).json({ message: "You are currently not logged in" });
  }
  const payload = {
    id: user._id,
    expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const token = jwt.encode(payload, process.env.JWT_SECRET);
  res.json({ message: "logged in", user, token });
});

//called on login failure
router.get("/auth/failure", (req, res) => {
  res.status(401).json({ message: "failed to login" });
});

//facebook strategy
router.get("/login/facebook", passport.authenticate("facebook"));
router.get("/oauth2/redirect/facebook", (req, res, next) => {
  passport.authenticate(
    "facebook",
    {
      failureRedirect: "/auth/failure",
    },
    (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: "user not found" });
      res.app.set("user", user);
      res.redirect(process.env.CLIENT_URL1);
    }
  )(req, res, next);
});

//google strategy
router.get("/login/google", passport.authenticate("google"));
router.get("/oauth2/redirect/google", (req, res, next) => {
  passport.authenticate(
    "google",
    {
      failureRedirect: "/auth/failure",
    },
    (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: "user not found" });
      res.app.set("user", user);
      res.redirect(process.env.CLIENT_URL1);
    }
  )(req, res, next);
});

router.post("/login", function (req, res, next) {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ message: info.message });
      }
      res.app.set("user", user);
      res.redirect(process.env.CLIENT_URL1);
    }
  )(req, res, next);
});

router.post("/register", register);

export default router;
