import bcrypt from "bcrypt";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";

const login = catchAsync(async function (req, res) {
  const user = await User.findOne({ username: req.body.username });

  res.app.set("user", user);
  res.redirect(process.env.CLIENT_URL1);
});

const register = catchAsync(async function (req, res) {
  const user = await User.create({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
    email: req.body.email,
  });
  res.json({ user, msg: "Successfully created" });
});

export { login, register };
