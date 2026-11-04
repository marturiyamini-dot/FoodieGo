

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token is required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId = decoded.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID missing in token"
            });
        }

        const user = await User.findById(userId).select("-passwordHash");

        if (!user || user.isActive === false) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.log("Authentication Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = { protect };
