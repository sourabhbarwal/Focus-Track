// backend/models/Task.js
const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    dueDate: Date,
    userId: { type: String, required: true }, // Firebase uid later
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = model("Task", taskSchema);
