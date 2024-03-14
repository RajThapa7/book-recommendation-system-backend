import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail.js";

const userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    validate: [isEmail, "enter a valid email"],
    unique: true,
  },
  provider: {
    type: String,
    default: "email",
  },
  provider_id: {
    type: String,
    default: null,
  },
  password: String,
  userId: Number,
  profile_image: String,
});

//increment the userId when creating a new user
userSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      let count = await User.countDocuments();
      const userId = ++count;
      this.userId = userId;
    }
  } catch (error) {
    next(error);
  }
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
