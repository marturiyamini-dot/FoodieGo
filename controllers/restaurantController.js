
const Restaurant = require("../models/Restaurant");

// POST - Create Restaurant
const createRestaurant = async (req, res) => {
    try {
        const {
            name,
            description,
            cuisineTypes,
            address,
            phone,
            isActive
        } = req.body;

        if (!name || !name.trim() || !address || !address.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name and address are required"
            });
        }

        const restaurant = new Restaurant({
            name,
            description,
            cuisineTypes,
            address,
            phone,
            isActive
        });

        const savedRestaurant = await restaurant.save();

        res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: savedRestaurant
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// GET - All Restaurants
const getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();

        res.status(200).json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch restaurants"
        });
    }
};

// GET - Restaurant by ID
const getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID"
            });
        }

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// PATCH - Update Restaurant
const updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID"
            });
        }

        const allowedFields = [
            "name",
            "description",
            "cuisineTypes",
            "address",
            "phone",
            "isActive"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid update fields provided"
            });
        }

        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            data: restaurant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid restaurant data"
        });
    }
};

// DELETE - Restaurant
const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID"
            });
        }

        const restaurant = await Restaurant.findByIdAndDelete(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};
