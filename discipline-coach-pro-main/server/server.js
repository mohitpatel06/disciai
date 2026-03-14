// server/server.js - Express server entry point

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/habits", require("./routes/habitRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// Root route
app.get("/", (req, res) => {
  res.json({ message: "DisciAI API is running" });
});

// Health route (for uptime ping)
app.get("/health", (req, res) => {
  res.status(200).send("Server running");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});