const mongoose = require("mongoose");

const testtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    assignedTo: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "under-review", "done"],
      default: "open",
    },

    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "low",
    },

    startDate: {
      type: String,
      required: true,
      match: [/^\d{2}\d{2}\d{4}$/, "Date must be in ddmmyyyy format"],
    },

    endDate: {
      type: String,
      default: null,
      match: [/^\d{2}\d{2}\d{4}$/, "Date must be in ddmmyyyy format"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TestTask", testtaskSchema);