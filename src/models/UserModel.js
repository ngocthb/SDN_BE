const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    dateOfBirth: { type: Date, required: false },
    gender: { type: Boolean, required: false }, // true = nu, false = nam
    picture: {
      type: "String",
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    bio: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
    isCoach: { type: Boolean, default: false },
    verifyOTP: { type: String },
    verifyOTPExpires: { type: Date },
    status: { type: Boolean, default: false },
    grantedAchievements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "achievements",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
