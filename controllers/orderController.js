


const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const calculateOrderTotal = require("../utils/calculateOrderTotal");

const placeOrder = async (req, res) => {
    try {
        const { deliveryAddress } = req.body;

        if (
            typeof deliveryAddress !== "string" ||
            !deliveryAddress.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Delivery address is required"
            });
        }

        console.log("Logged-in User ID:", req.user._id);

        const allCarts = await Cart.find();

        console.log("Saved Carts:", allCarts);

        const cart = await Cart.findOne({
            user: req.user._id
        });

        console.log("Found Cart:", cart);

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const orderItems = [];
        const restaurantIds = new Set();

        for (const cartItem of cart.items) {
            const menuItem = await MenuItem.findById(
                cartItem.menuItem
            );

            if (!menuItem) {
                return res.status(404).json({
                    success: false,
                    message: "Menu item not found"
                });
            }

            if (menuItem.isAvailable === false) {
                return res.status(400).json({
                    success: false,
                    message: `${menuItem.name} is unavailable`
                });
            }

            restaurantIds.add(
                menuItem.restaurant.toString()
            );

            orderItems.push({
                _id: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: cartItem.quantity
            });
        }

        if (restaurantIds.size > 1) {
            return res.status(400).json({
                success: false,
                message: "Items must belong to one restaurant"
            });
        }

        const {
            orderItems: items,
            subtotal,
            total
        } = calculateOrderTotal(orderItems);

        const order = await Order.create({
            user: req.user._id,
            items,
            subtotal,
            total,
            deliveryAddress: deliveryAddress.trim(),
            status: "placed"
        });

        cart.items = [];
        await cart.save();

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        console.log("Order Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    placeOrder,
    getOrderHistory,
    getOrderById
};
