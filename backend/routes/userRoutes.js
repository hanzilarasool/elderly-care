const express = require('express');
const router = express.Router();
const emailValidator = require('../middlewares/emailValidationMiddleware');
const {register,login}=require("../controllers/user-controllers")
// Updated registration route
router.post('/register', emailValidator,register);
router.post('/login', emailValidator,login);
module.exports = router;


 





// const express = require("express");
// const router = express.Router();
// const { 
//   register, 
//   login, 
//   getMe, 
//   updateMe, 
//   deleteUser,
//   assignPatientToDoctor,
//   logout 
// } = require("../controllers/userController");
// const { protect, restrictTo } = require("../middleware/authMiddleware");

// // Public routes
// router.post("/register", register);
// router.post("/login", login);

// // Protected routes
// router.get("/me", protect, getMe);
// router.patch("/updateMe", protect, updateMe);
// router.get("/logout", protect, logout);

// // Admin-only routes
// router.delete("/:id", protect, restrictTo("admin"), deleteUser);
// router.post("/assign", protect, restrictTo("admin"), assignPatientToDoctor);

// module.exports = router;