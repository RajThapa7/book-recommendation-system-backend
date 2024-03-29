import bcrypt from "bcrypt";
import jwt from "jwt-simple";
import User from "../model/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const registerAdmin = catchAsync(async function (req, res) {
  const user = await User.create({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
    email: req.body.email,
    isAdmin: true,
  });
  res.json({ user, message: "Admin Successfully created" });
});

const adminLogin = catchAsync(async (req, res) => {
  const { username, password, email } = req.body;
  if (username === undefined && email === undefined) {
    throw new AppError("Email or Username is Required");
  }
  if (!password) {
    throw new AppError("Password is Required");
  }

  const user = await User.findOne({ ...(username ? { username } : { email }) });

  if (!user) {
    throw new AppError("Incorrect email or username", 400);
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("Incorrect password", 400);
  }
  const payload = {
    id: user._id,
    expire: Date.now() + 1000 * 60 * 60 * 24 * 7,
    isAdmin: user.isAdmin,
  };
  const token = jwt.encode(payload, process.env.JWT_SECRET);
  res.json({ message: "Admin logged in successfully", user, token });
});

export { adminLogin, registerAdmin };
