const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization) {
      const authHeader = String(req.headers.authorization || "").trim();
      const parts = authHeader.split(/\s+/);
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        token = parts[1];
      } else if (parts.length === 1 && parts[0].toLowerCase().startsWith("bearer")) {
        token = authHeader.slice(6).trim();
      }

      if (!token) {
        console.error("Auth Middleware: bearer header present but token extraction failed", { authHeader });
      }

      if (token && token !== "null" && token !== "undefined") {
        const isProduction = process.env.NODE_ENV === "production";
        const secret = process.env.JWT_SECRET || (!isProduction ? "dev_jwt_secret" : undefined);
        if (!secret) {
          console.error("JWT_SECRET is not configured");
          return res.status(500).json({ message: "Authentication configuration error" });
        }

        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        return next();
      }
    }

    return res.status(401).json({ message: "No token" });
  } catch (error) {
    const err = error || {};
    console.error("Auth Middleware Error:", err.name || "Error", err.message || err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = protect;