const express = require("express");
const path = require("path");
const user_route = express();
const session = require("express-session");
const nocache = require("nocache");

user_route.use(nocache());
user_route.use(
  session({
    secret: process.env.SESSION_SECRET || "default_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
  })
);

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));

const auth = require("../middleware/auth");

user_route.use(express.static(path.join(__dirname, "public")));

user_route.set("views", path.join(__dirname, "../views/users"));
user_route.set("view engine", "ejs");

const userController = require("../controllers/userController");

user_route.get("/register", auth.isLogout, userController.loadRegister);

user_route.post("/register", userController.insertUser);

user_route.get("/", auth.isLogout, userController.rootDetermine);

user_route.get("/login", auth.isLogout, userController.loginUser);

user_route.post("/login", userController.verifyLogin);

user_route.get("/home", auth.isLogin, userController.loadHome);

user_route.post("/logout", userController.logoutUser);

module.exports = user_route;
