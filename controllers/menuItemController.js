
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

const allowedCategories = [
    "Starters",
    "Main Course",
    "Desserts",
    "Beverages"
];

const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id) &&
        /^[0-9a-fA-F]{24}$/.test(id);
};

exports.createMenuItem = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            imageUrl,
            isAvailable,
            restaurant
        } = req.body;

        if (!name || !name.trim() ||
            price === undefined ||
            !category ||
            !restaurant) {
            return res.status(400).json({
                success: false,
                message: "Name, price, category and restaurant are required"
            });
        }


        if (!isValidId(restaurant)) {
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID"
            });
        }


        if (typeof price !== "number" ||
            !Number.isFinite(price) ||
            price <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than zero"
            });
        }

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: "Invalid category"
            });
        }

        const restaurantExists =
            await Restaurant.findById(restaurant);

        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        const menuItem = await MenuItem.create({
            name,
            description,
            price,
            category,
            imageUrl,
            isAvailable,
            restaurant
        });

        return res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            data: menuItem
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu item data"
        });
    }
};

exports.getMenuItems = async (req, res) => {
    try {
        const {
            restaurantId,
            category,
            isAvailable,
            sort = "price_asc",
            page = 1,
            limit = 10
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 50
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit. Maximum limit is 50"
            });
        }
        const sortOptions = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 },
            newest: { createdAt: -1 }
        };

        if (!sortOptions[sort]) {
            return res.status(400).json({
                success: false,
                message: "Invalid sort option"
            });
        }
        const filter = {};

        if (restaurantId) {
            if (!isValidId(restaurantId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid restaurant ID"
                });
            }

            filter.restaurant = restaurantId;
        }

        if (category) {
            if (!allowedCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category"
                });
            }

            filter.category = category;
        }

        if (isAvailable !== undefined) {
            if (
                isAvailable !== "true" &&
                isAvailable !== "false"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "isAvailable must be true or false"
                });
            }

            filter.isAvailable = isAvailable === "true";
        }

        const totalItems =
            await MenuItem.countDocuments(filter);

        const items = await MenuItem.find(filter)
            .populate("restaurant", "name")
            .sort(sortOptions[sort])
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        return res.status(200).json({
            success: true,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalItems / limitNumber),
            totalItems: totalItems,
            items: items
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch menu items"
        });
    }
};

exports.getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID"
            });
        }

        const menuItem = await MenuItem.findById(id)
            .populate("restaurant", "name");

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: menuItem
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch menu item"
        });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID"
            });
        }

    
        const allowedFields = [
            "name",
            "description",
            "price",
            "category",
            "imageUrl",
            "isAvailable",
            "restaurant"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided"
            });
        }

        if (
            "name" in updates &&
            (typeof updates.name !== "string" ||
                !updates.name.trim())
        ) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty"
            });
        }

        if (
            "price" in updates &&
            (typeof updates.price !== "number" ||
                !Number.isFinite(updates.price) ||
                updates.price <= 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than zero"
            });
        }

        if (
            "category" in updates &&
            !allowedCategories.includes(updates.category)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid category"
            });
        }

        if (
            "isAvailable" in updates &&
            typeof updates.isAvailable !== "boolean"
        ) {
            return res.status(400).json({
                success: false,
                message: "isAvailable must be true or false"
            });
        }


        if ("restaurant" in updates) {
            if (!isValidId(updates.restaurant)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid restaurant ID"
                });
            }

            const restaurantExists =
                await Restaurant.findById(updates.restaurant);

            if (!restaurantExists) {
                return res.status(404).json({
                    success: false,
                    message: "Restaurant not found"
                });
            }
        }

        const updatedItem =
            await MenuItem.findByIdAndUpdate(
                id,
                updates,
                {
                    new: true,
                    runValidators: true
                }
            ).populate("restaurant", "name");

        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            data: updatedItem
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid menu item update"
        });
    }
};


exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid menu item ID"
            });
        }

        const deletedItem =
            await MenuItem.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Menu item deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete menu item"
        });
    }
};
