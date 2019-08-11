//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use("/public", express.static(__dirname + '/public')); //static file
app.use(bodyParser.urlencoded({extended: true})); //parse body
app.set("view engine", "ejs"); //set ejs

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize()); //initialize passport
app.use(passport.session()); //use passport session

//Connect to mongodb with mongoose
mongoose.connect("mongodb://localhost:27017/academyUsersDB", {useNewUrlParser: true}); 
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: {type: String, required: true}
});

userSchema.plugin(passportLocalMongoose) //save users into mongodb with hash and salt using passport

const User = new mongoose.model("users", userSchema) //create model collection "users"

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser()); //serialize session cookie
passport.deserializeUser(User.deserializeUser()); //deserialize session cookie

const logoutNavBar = {
  loginType: "Login",
  loginRoute: "/login",
  signUpApply: "Sign Up",
  signUpApplyRoute: "/signup"
};

const loginNavBar = {
  loginType: "Logout",
  loginRoute: "/logout",
  signUpApply: "Register",
  signUpApplyRoute: "/apply"
}

app.get("/", function(req, res) {
  if(req.isAuthenticated()) {
    res.redirect("/personal");
  } else {
    res.render("home", logoutNavBar);
  }
});

app.get("/contact", function (req, res) {
  let changeNavBar = req.isAuthenticated() ? loginNavBar : logoutNavBar;
  res.render("contact", changeNavBar);
  // console.log(req.query.origin);
});

app.route("/signup")
  .get(function(req, res) {
    res.render("signup", logoutNavBar);
  })
  .post(function(req, res) {
    
    const newUser = new User({
      username: req.body.username
    });

    User.register(newUser, req.body.password, function(err, user) {
      if(err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        passport.authenticate('local')(req, res, function() {
          res.redirect('/personal');
        });
      }
    });
  });

app.route("/login")
.get(function(req, res) {
  res.render("login", logoutNavBar);
})
.post(passport.authenticate('local',
 {failureRedirect: "/login",
  failureMessage: "Invalid email or password"}),
   function(req, res) {
    req.login(req.user, function(err) {
      if(err) console.log(err);
      res.redirect('/personal');
    });
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/personal", function(req, res) {
  if(req.isAuthenticated()) {
    res.render("personal", loginNavBar);
  } else {
    res.redirect("/login");
  }
});

app.get("/apply", function(req, res) {
  res.render("apply", loginNavBar);
});

app.listen(3000, function() {
  console.log("Server is listening on port 3000.");
});