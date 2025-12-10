// // backend/models/Team.js
// const mongoose = require("mongoose");
// const User = require("./User");

// const teamSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     adminFirebaseUid: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     // members: [
//     //   {
//     //     userId: {
//     //       type: mongoose.Schema.Types.ObjectId,
//     //       ref: "User",
//     //     },
//     //     role: {
//     //       type: String,
//     //       enum: ["member", "admin"],
//     //       default: "member",
//     //     },
//     //   },
//     // ],
//     memberFirebaseUids: {
//       type: [String],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Team", teamSchema);

const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    adminFirebaseUid: {
      type: String,
      required: true,
      index: true,
    },
    memberFirebaseUids: {
      type: [String], // includes admin + members
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
