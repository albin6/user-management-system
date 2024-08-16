require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system");

// Middleware

app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);

const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`)
);
