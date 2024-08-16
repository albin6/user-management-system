const express = require("express");
const nocache = require("nocache");
const path = require("path");
const admin_route = express();
const session = require("express-session");

admin_route.use(nocache());
admin_route.use(
  session({
    secret: process.env.SESSION_SECRET || "default_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
  })
);

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));

admin_route.use(express.static(path.join(__dirname, "public")));

admin_route.set("views", path.join(__dirname, "../views/admin"));
admin_route.set("view engine", "ejs");

const adminController = require("../controllers/adminController");
const auth = require("../middleware/adminAuth");

admin_route.get("/", auth.isLogout, adminController.loadLogin);

admin_route.post("/verify", adminController.verifyLogin);

admin_route.get("/home", auth.isLogin, adminController.loadDashboard);

admin_route.get("/search", adminController.showUser);

admin_route.post("/search", adminController.searchUser);

admin_route.get("/newUser", auth.isLogin, adminController.loadAddUser);

admin_route.post("/add", auth.isLogin, adminController.addNewUser);

admin_route.get("/edit/:id", adminController.editInfo);

admin_route.put("/edit/:id", adminController.editUser);

admin_route.delete("/edit/:id", adminController.deleteUser);

admin_route.get("/logout", auth.isLogin, adminController.logout);

admin_route.get("*", (req, res) => {
  res.redirect("/admin");
});

module.exports = admin_route;
