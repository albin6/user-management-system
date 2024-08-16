const isLogin = async (req, res, next) => {
  try {
    if (req.session.user_role) {
      console.log("in isLogin auth going to execute next()");

      return next();
    } else {
      return res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isLogout = async (req, res, next) => {
  try {
    if (req.session.user_role) {
      return res.redirect("/admin/home");
    } else {
      return next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
};
