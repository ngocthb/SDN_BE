const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    passwordHash: { type: String, required: true },
    dateOfBirth: { type: Date, required: false },
    gender: { type: Boolean, required: false }, // true = nu, false = nam
    isAdmin: { type: Boolean, default: false },
    isCoach: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
