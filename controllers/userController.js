const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  try {
    const pass = await bcrypt.hash(password, 10);
    return pass;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async (req, res) => {
  try {
    if (req.session.user_exists) {
      req.session.user_exists = false;
      res.render("registration", {
        title: "Register",
        message: "",
        errMessage: "Email already exists!!",
      });
    } else if (
      req.session.regResult === true ||
      req.session.regResult === false
    ) {
      if (req.session.regResult) {
        req.session.regResult = null;
        res.render("registration", {
          title: "Register",
          message: "Your registration has been successful",
          errMessage: "",
        });
      } else {
        req.session.regResult = null;
        res.render("registration", {
          title: "Register",
          message: "",
          errMessage: "Your registration has failed",
        });
      }
    } else {
      res.render("registration", {
        title: "Register",
        message: "",
        errMessage: "",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const isEmailExists = await User.findOne({ email: req.body.email });
    console.log(isEmailExists);
    console.log(req.body.email);

    if (isEmailExists) {
      console.log("in post register root and in emailexists");
      req.session.user_exists = true;
      res.redirect("/register");
    } else {
      console.log("in user creation");

      const sPassword = await hashPassword(req.body.password);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: sPassword,
        is_Admin: false,
      });
      const userData = await user.save();
      if (userData) {
        req.session.regResult = true;
        res.redirect("/register");
      } else {
        req.session.regResult = false;
        res.redirect("/register");
      }
      // if (userData) {
      //   res.render("registration", {
      //     title: "Register",
      //     message: "Your registration has been successful",
      //   });
      // } else {
      //   res.render("registration", {
      //     title: "Register",
      //     message: "Your registration has failed",
      //   });
      // }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// root
const rootDetermine = (req, res) => {
  try {
    if (req.session.user_id) {
      res.render("home", {
        title: "Home",
        userName: req.session.username,
      });
    } else if (req.session.invalid_user) {
      req.session.invalid_user = false;
      res.render("login", {
        title: "Login",
        message: "Invalid Credentials",
      });
    } else {
      res.render("login", {
        title: "Login",
        message: "",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// user login
const loginUser = async (req, res) => {
  try {
    if (req.session.user_id) {
      res.redirect("/");
    } else {
      res.render("login", {
        title: "Login",
        message: "",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (!userData.is_Admin) {
          req.session.user_id = userData._id;
          req.session.username = userData.name;
          res.redirect("/");
        } else {
          req.session.invalid_user = true;
          res.redirect("/");
        }
      } else {
        req.session.invalid_user = true;
        res.redirect("/");
      }
    } else {
      req.session.invalid_user = true;
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async (req, res) => {
  try {
    res.render("home", {
      title: "Home",
      userName: req.session.username,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const logoutUser = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginUser,
  verifyLogin,
  loadHome,
  logoutUser,
  rootDetermine,
};
