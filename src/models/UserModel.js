const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    phone: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    password: { type: String, required: true },
    token: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
