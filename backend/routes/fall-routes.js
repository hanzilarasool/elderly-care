const express = require("express");
const router = express.Router();
const { detectFall,getDoctorFalls,clearFallAlert, clearAllFallAlerts } = require("../controllers/fall-controller");
const {protect}=require("../middleware/auth");
router.post("/detect", protect ,detectFall);
router.get("/doctor", protect,getDoctorFalls);
router.delete("/doctor/:alertId", protect, clearFallAlert); // New route
router.delete("/doctor/all", protect, clearAllFallAlerts); // New route
module.exports = router;