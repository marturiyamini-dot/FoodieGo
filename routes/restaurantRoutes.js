

const express = require("express");
const router = express.Router();

const {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
} = require("../controllers/restaurantController");

// POST
router.post("/", createRestaurant);

// GET all
router.get("/", getRestaurants);

// GET by ID
router.get("/:id", getRestaurantById);

// PATCH
router.patch("/:id", updateRestaurant);

// DELETE
router.delete("/:id", deleteRestaurant);

module.exports = router;
