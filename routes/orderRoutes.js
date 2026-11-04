

const express = require("express");
const router = express.Router();

const {
    placeOrder,
    getOrderHistory,
    getOrderById
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", placeOrder);
router.get("/", getOrderHistory);
router.get("/:id", getOrderById);

module.exports = router;
