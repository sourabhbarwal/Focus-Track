// // backend/routes/userRoutes.js
// const express = require("express");
// const User = require("../models/User");

// const router = express.Router();

// // All users (for admin panel)
// router.get("/", async (req, res) => {
//   try {
//     const users = await User.find()
//       .sort({ createdAt: -1 })
//       .select("firebaseUid email name role createdAt");
//     res.json(users);
//   } catch (err) {
//     console.error("Error in GET /users:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Create user (signup)
// router.post("/", async (req, res) => {
//   try {
//     const { firebaseUid, email, name, photoURL, role, provider } = req.body;

//     if (!firebaseUid || !email || !role) {
//       return res
//         .status(400)
//         .json({ message: "firebaseUid, email and role are required" });
//     }

//     const existing = await User.findOne({ firebaseUid });
//     if (existing) {
//       return res.status(200).json(existing);
//     }

//     const user = await User.create({
//       firebaseUid,
//       email,
//       name,
//       photoURL,
//       role,      // 👈 IMPORTANT
//       provider,
//     });

//     res.status(201).json(user);
//   } catch (err) {
//     console.error("Error in POST /users:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get user by Firebase UID (used in AuthContext)
// router.get("/byUid", async (req, res) => {
//   try {
//     const { firebaseUid } = req.query;
//     if (!firebaseUid) {
//       return res.status(400).json({ message: "firebaseUid required" });
//     }

//     const user = await User.findOne({ firebaseUid });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user); // 👈 includes role
//   } catch (err) {
//     console.error("Error in GET /users/byUid:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

// backend/routes/userRoutes.js
const express = require("express");
const User = require("../models/User");

const router = express.Router();

// 🔹 GET /users → list all users (for admin panel)
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("firebaseUid email name role createdAt");
    res.json(users);
  } catch (err) {
    console.error("Error in GET /users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 POST /users → create user on signup (or return existing)
router.post("/", async (req, res) => {
  try {
    const { firebaseUid, email, name, photoURL, role, provider } = req.body;

    if (!firebaseUid || !email || !role) {
      return res
        .status(400)
        .json({ message: "firebaseUid, email and role are required" });
    }

    const existing = await User.findOne({ firebaseUid });
    if (existing) {
      return res.status(200).json(existing);
    }

    const user = await User.create({
      firebaseUid,
      email,
      name,
      photoURL,
      role,
      provider,
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Error in POST /users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 GET /users/byUid?firebaseUid=... → used by AuthContext
router.get("/byUid", async (req, res) => {
  try {
    const { firebaseUid } = req.query;
    if (!firebaseUid) {
      return res.status(400).json({ message: "firebaseUid required" });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error in GET /users/byUid:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
