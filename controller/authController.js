import bcrypt from "bcrypt";
import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";

const register = catchAsync(async function (req, res) {
  const user = await User.create({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
    email: req.body.email,
  });
  res.json({ user, message: "Successfully created" });
});

export { register };
