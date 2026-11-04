const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser,
    getCurrentUser
} = require("../controllers/authController");

const authenticate = require("../middleware/authenticate");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;