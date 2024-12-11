// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config");
const { router: conversationRouter } = require("./controller/conversation");

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB()
  .then(() => console.log("MongoDB connection established successfully"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1); // Exit process if database connection fails
  });

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API routes
app.use("/api/conversation", conversationRouter);

// Serve static files from the React app (after building the frontend)
app.use(express.static(path.join(__dirname, "../frontend", "build")));

// Catch-all handler for React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
