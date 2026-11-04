const express = require("express");
const router = express.Router();

const {
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem
} = require("../controllers/menuItemController");

router.post("/", createMenuItem);
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);
router.patch("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

module.exports = router;