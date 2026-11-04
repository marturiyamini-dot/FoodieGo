

const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate("items.menuItem");

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: { items: [] },
                subtotal: 0
            });
        }

        const subtotal = cart.items.reduce((sum, item) => {
            return sum + item.menuItem.price * item.quantity;
        }, 0);

        res.status(200).json({
            success: true,
            cart,
            subtotal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addToCart = async (req, res) => {
    try {
        const { menuItemId, quantity } = req.body;

        if (!menuItemId || !mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: "Valid menu item ID is required"
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const menuItem = await MenuItem.findById(menuItemId);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        if (menuItem.isAvailable === false) {
            return res.status(400).json({
                success: false,
                message: "Menu item is not available"
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = new Cart({
                user: req.user._id,
                items: []
            });
        }

        const existingItem = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                menuItem: menuItemId,
                quantity
            });
        }

        await cart.save();

        cart = await Cart.findById(cart._id)
            .populate("items.menuItem");

        res.status(200).json({
            success: true,
            message: "Item added to cart successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { menuItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: "Valid menu item ID is required"
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer"
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.menuItem.toString() === menuItemId
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        item.quantity = quantity;

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.menuItem");

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart: updatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const { menuItemId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
            return res.status(400).json({
                success: false,
                message: "Valid menu item ID is required"
            });
        }

        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const initialLength = cart.items.length;

        cart.items = cart.items.filter(
            item => item.menuItem.toString() !== menuItemId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
            .populate("items.menuItem");

        res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            cart: updatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is already empty"
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
