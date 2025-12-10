const express = require("express");
const Team = require("../models/Team");
const User = require("../models/User");
const Task = require("../models/Task");

const router = express.Router();

/**
 * POST /teams/createFromUsers
 * Admin creates a team, selecting users by firebaseUid.
 */
router.post("/createFromUsers", async (req, res) => {
  try {
    const { adminFirebaseUid, name, memberFirebaseUids } = req.body;

    if (!adminFirebaseUid || !name) {
      return res
        .status(400)
        .json({ message: "adminFirebaseUid and name are required" });
    }

    const adminUser = await User.findOne({ firebaseUid: adminFirebaseUid });
    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }
    if (adminUser.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin users can create teams" });
    }

    const uniqueMembers = new Set(memberFirebaseUids || []);
    uniqueMembers.add(adminFirebaseUid); // ensure admin is member

    const team = await Team.create({
      name,
      adminFirebaseUid,
      memberFirebaseUids: Array.from(uniqueMembers),
    });

    res.status(201).json(team);
  } catch (err) {
    console.error("Error in POST /teams/createFromUsers:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /teams/byAdmin?adminFirebaseUid=...
 * All teams created by this admin.
 */
router.get("/byAdmin", async (req, res) => {
  try {
    const { adminFirebaseUid } = req.query;
    if (!adminFirebaseUid) {
      return res
        .status(400)
        .json({ message: "adminFirebaseUid required" });
    }

    const teams = await Team.find({ adminFirebaseUid }).sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    console.error("Error in GET /teams/byAdmin:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /teams/forUser?firebaseUid=...
 * All teams where this user is a member (or admin).
 * Used in Dashboard to show team boards for members.
 */
router.get("/forUser", async (req, res) => {
  try {
    const { firebaseUid } = req.query;
    if (!firebaseUid) {
      return res.status(400).json({ message: "firebaseUid required" });
    }

    const teams = await Team.find({
      $or: [
        { adminFirebaseUid: firebaseUid },
        { memberFirebaseUids: firebaseUid },
      ],
    }).sort({ createdAt: -1 });

    res.json(teams);
  } catch (err) {
    console.error("Error in GET /teams/forUser:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /teams/details?teamId=...
 * Full details + members + progress.
 */
router.get("/details", async (req, res) => {
  try {
    const { teamId } = req.query;
    if (!teamId) {
      return res.status(400).json({ message: "teamId required" });
    }

    const team = await Team.findById(teamId).lean();
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // load member user docs
    const users = await User.find({
      firebaseUid: { $in: team.memberFirebaseUids },
    }).select("firebaseUid email name role");

    // progress from tasks
    const totalTasks = await Task.countDocuments({ teamId });
    const completedTasks = await Task.countDocuments({
      teamId,
      status: "done",
    });

    const progressPercent =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    res.json({
      team,
      users,
      stats: {
        totalTasks,
        completedTasks,
        progressPercent,
      },
    });
  } catch (err) {
    console.error("Error in GET /teams/details:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /teams/:id
 * Admin can edit team name and members.
 */
router.put("/:id", async (req, res) => {
  try {
    const teamId = req.params.id;
    const { adminFirebaseUid, name, memberFirebaseUids } = req.body;

    if (!adminFirebaseUid) {
      return res
        .status(400)
        .json({ message: "adminFirebaseUid required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.adminFirebaseUid !== adminFirebaseUid) {
      return res
        .status(403)
        .json({ message: "Only this team admin can edit the team" });
    }

    if (name) team.name = name;

    if (Array.isArray(memberFirebaseUids)) {
      const uniqueMembers = new Set(memberFirebaseUids);
      uniqueMembers.add(adminFirebaseUid); // always include admin
      team.memberFirebaseUids = Array.from(uniqueMembers);
    }

    await team.save();

    res.json(team);
  } catch (err) {
    console.error("Error in PUT /teams/:id:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
