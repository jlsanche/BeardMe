var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Beard = require("../models/beard");

//root route
router.get("/", function(req, res) {
  res.render("landing");
});

// show register form
router.get("/register", function(req, res) {
  res.render("register", { page: "register" });
});

//handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
  
  });

  if (req.body.adminCode === process.env.ADMIN_CODE) {
    newUser.isAdmin = true;
  }

  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      return res.render("register", { error: err.message });
    }
    passport.authenticate("local")(req, res, function() {
      req.flash(
        "success",
        "Successfully Signed Up. Nice to meet you! " + req.body.username
      );
      res.redirect("/beards");
    });
  });
});

//show login form
router.get("/login", function(req, res) {
  res.render("login", { page: "login" });
});

//handling login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/beards",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome to Beard Me!"
  }),
  function(req, res) {}
);

// logout route
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "See you later!");
  res.redirect("/beards");
});

/* USERS PROFILES  */
router.get("/users/:id", function(req, res) {
  User.findById(req.params.id, function(err, foundUser) {
    if (err) {
      req.flash("error", "Something went wrong");
       return res.redirect("/");
    }

    Beard.find()
      .where('author.id')
      .equals(foundUser._id)
      .exec(function(err, beards) {
        if (err) {
          req.flash("error", "Something went wrong");
         return res.redirect("/");
        }

        res.render("beards/show", { user: foundUser, beard: beards });
      })
  });
});

module.exports = router;
