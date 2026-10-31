
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Restaurant name is required"],
            trim: true,
            minlength: [2, "Name must contain at least 2 characters"]
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        cuisineTypes: {
            type: [String],
            default: []
        },

        address: {
            type: String,
            required: [true, "Restaurant address is required"],
            trim: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
