const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Menu item name is required"],
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0.01, "Price must be greater than zero"]
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "Starters",
                "Main Course",
                "Desserts",
                "Beverages"
            ],
            trim: true
        },
        imageUrl: {
            type: String,
            trim: true,
            default: ""
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Restaurant",
            required: [true, "Restaurant reference is required"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);