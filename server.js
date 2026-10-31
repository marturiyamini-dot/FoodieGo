
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Import routes
const restaurantRoutes = require("./routes/restaurantRoutes");

// Register routes
app.use("/api/restaurants", restaurantRoutes);

// Test route
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "FoodieGo server is running"
    });
});

// 404 handler (must be last)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Start server after MongoDB connects
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`FoodieGo Server Running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
