const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    project_name: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },
    pm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    qa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    technical_lead: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    ],
    ba: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    ],
    developers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    ],
    testers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    ],
    technical_consultancy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("projects", projectSchema);
