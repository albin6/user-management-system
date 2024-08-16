const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// rendering login
const loadLogin = async (req, res) => {
  try {
    if (req.session.user_role) {
      res.render("home");
    } else if (req.session.invalid) {
      req.session.invalid = false;
      res.render("login", {
        title: "Admin | Login",
        message: "Invalid Credentials",
      });
    } else {
      res.render("login", {
        title: "Admin | Login",
        message: "",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verifying login credentials
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log("email :", email);
    const userData = await User.findOne({ email: email });
    console.log("userData :", userData);
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      console.log("passwordMatch :", passwordMatch);
      if (passwordMatch) {
        console.log("is Admin : ", userData.is_Admin);
        if (userData.is_Admin === true) {
          // req.session.user_id = userData._id;
          req.session.user_role = "admin";
          res.redirect("/admin/home");
          console.log("redirected");
        } else {
          req.session.invalid = true;
          res.redirect("/admin");
        }
      } else {
        req.session.invalid = true;
        res.redirect("/admin");
      }
    } else {
      req.session.invalid = true;
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// dashboard rendering
const loadDashboard = async (req, res) => {
  try {
    console.log("in loadDashboard going to render home");
    const users = await User.find({});
    res.render("home", {
      title: "Admin Panel",
      users: users,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// rendering add new user page
const loadAddUser = async (req, res) => {
  try {
    if (req.session.is_userExists) {
      req.session.is_userExists = false;
      res.render("addUser", {
        message: "The email already exists",
      });
    } else if (
      req.session.AdRegResult === true ||
      req.session.AdRegResult === false
    ) {
      if (req.session.AdRegResult) {
        req.session.AdRegResult = null;
        res.render("addUser", {
          message: "Your registration has been successful",
        });
      } else {
        req.session.AdRegResult = null;
        res.render("addUser", {
          message: "Your registration has failed",
        });
      }
    } else {
      res.render("addUser", {
        message: "",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// adding new user
const addNewUser = async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      req.session.is_userExists = true;
      res.redirect("/admin/newUser");
    } else {
      const sPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: sPassword,
        is_Admin: false,
      });
      const userData = await user.save();
      if (userData) {
        req.session.AdRegResult = true;
        res.redirect("/admin/newUser");
      } else {
        req.session.AdRegResult = false;
        res.redirect("/admin/newUser");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// rendering edit user page
const editInfo = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.params.id });
    if (req.session.is_userExists) {
      req.session.is_userExists = false;
      res.render("edit", {
        title: "Admin | Edit",
        message: "Email already exists",
        user: userData,
      });
    } else {
      res.render("edit", {
        title: "Admin | Edit",
        message: "",
        user: userData,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// validating and editing user details
const editUser = async (req, res) => {
  try {
    // Find the user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.send("User not found");
    }

    // Check if email is being updated
    let emailChanged = false;
    if (req.body.email && req.body.email !== user.email) {
      emailChanged = true;
    }

    // Check if the new email is already taken by someone else
    if (emailChanged) {
      const userExists = await User.findOne({ email: req.body.email });
      if (userExists) {
        req.session.is_userExists = true;
        return res.redirect(`/admin/edit/${req.params.id}`);
      }
    }

    // Update only the fields that are provided and changed
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (emailChanged) updateFields.email = req.body.email; // Email changed but not exists in db
    if (req.body.password) {
      updateFields.password = await bcrypt.hash(req.body.password, 10);
    }
    updateFields.updatedAt = Date.now();

    // Perform the update
    await User.findByIdAndUpdate(req.params.id, updateFields);

    console.log("redirected editUser PUT");
    res.redirect("/admin/home");
  } catch (error) {
    console.log(error.message);
    res.send("Server error");
  }
};

// deleting user
const deleteUser = async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
    res.redirect("/admin");
  } catch (error) {
    console.log(error);
  }
};

// searching user
const searchUser = async (req, res) => {
  try {
    let searchName = req.body.searchName;
    const searchNoSpecialChar = searchName.replace(/[^a-zA-Z0-9 ]/g, "");

    const users = await User.find({
      name: { $regex: new RegExp(searchNoSpecialChar, "i") },
    });

    res.render("search", {
      title: "Search User",
      users: users,
    });
    // res.redirect("/admin/search/:id");
  } catch (error) {
    console.log(error);
  }
};

// rendering search result
const showUser = async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id });
    res.render("search", {
      title: "Search User",
      users: user,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// logout
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  loadAddUser,
  addNewUser,
  editInfo,
  editUser,
  deleteUser,
  searchUser,
  showUser,
};
