//jshint esversion:6
require('dotenv').config();
const express     = require("express");
const ejs         = require("ejs");
const bodyParser  = require("body-parser");
const mongoose    = require("mongoose");
const session     = require("express-session");
const MongoStore  = require('connect-mongo')(session);
const passport    = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const helmet         = require("helmet");
const nodemailer     = require("nodemailer");
const flash          = require("connect-flash");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate   = require('mongoose-findorcreate');

const app = express();

//helmetjs security
app.use(helmet.hidePoweredBy()) //hide what the site is powered by Express;
app.use(helmet.frameguard({action: 'deny'})); //prevent anyone from putting page in an iframe (clickjacking)
app.use(helmet.xssFilter()); //prevent Cross-site scripting(XSS)
app.use(helmet.noSniff()); //stops MIME sniffing
app.use(helmet.ieNoOpen());
app.use(helmet.hsts({ maxAge: 15552000 })); //instructs browsers to use HTTPS for the next 180 days
app.use(helmet.contentSecurityPolicy({
  directives:{
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'stackpath.bootstrapcdn.com', 'fonts.googleapis.com', 'use.fontawesome.com'
    ],
    scriptSrc: ["'self'", 'code.jquery.com', 'cdnjs.cloudflare.com', 'stackpath.bootstrapcdn.com', 'maps.googleapis.com', 'ajax.googleapis.com'],
    fontSrc: ["'self'", 'fonts.googleapis.com', 'use.fontawesome.com', 'fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'maps.gstatic.com', 'maps.googleapis.com']
  }
}));

app.use("/public", express.static(__dirname + '/public')); //static file
app.use(bodyParser.urlencoded({extended: true})); //parse body
app.set("view engine", "ejs"); //set ejs

//setting session ID cookie
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(passport.initialize()); //initialize passport
app.use(passport.session()); //use passport session which will attach the user object to req.user
app.use(flash());

app.use(function(req, res, next) {
  res.locals.error = req.flash('error');
  res.locals.password_err = req.flash('password_error');
  next();
});

//Connect to mongodb with mongoose and create db name
mongoose.connect(`mongodb+srv://jmin:${process.env.ATLAS_PASSWORD}@cluster0-a08fp.mongodb.net/academyUsers`, {
  useNewUrlParser: true
});

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  googleId: String,
  facebookId: String,
  info: {
    first_name: String,
    last_name: String,
    phone_number: String,
    address: {
      street: String,
      floor: String,
      city: String,
      state: String,
      zip: Number
    }
  },
  relations: []
});

//save users into mongodb with hash and salt using passport
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//create model collection "users"
const User = new mongoose.model("users", userSchema);

passport.use(User.createStrategy());

//serialize id; keep track of id
// passport.serializeUser(User.serializeUser());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

 //deserialize id; makes a request to DB to find profile information
 // passport.deserializeUser(User.deserializeUser());
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//google register oauth2
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://serene-gorge-44988.herokuapp.com/auth/google/academy"
  },
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      googleId: profile.id
    }, function (err, user) {
      return cb(err, user);
    });
  }
));

//facebook register aouth2
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://serene-gorge-44988.herokuapp.com/auth/facebook/academy"
  },
  function (accessToken, refreshToken, profile, cb) {
    User.findOrCreate({
      facebookId: profile.id
    }, function (err, user) {
      return cb(err, user);
    });
  }
));

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

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile']
  }));

app.get('/auth/google/academy',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/personal');
  });

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/academy',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/personal');
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

    if(req.body.password.length < 8) {
      req.flash("password_error", "Password must be at least 8 characters long.");
    } else if(req.body.password !== req.body.repeat_password) {
      req.flash("password_error", "Passwords don't match.");
    }
    
    User.findOne({username: req.body.username}, function(err, user) {
      if(err) { console.log(err) }
      if (user) { 
        req.flash("error", "A user with the given email is already registered.");
      }
      const newUser = new User({ username: req.body.username });
      User.register(newUser, req.body.password, function (err, user) {
        if (err) {
          console.log(err);
          res.redirect("/signup");
        } else {
          passport.authenticate('local')(req, res, function () {
            res.redirect('/personal');
          });
        }
      });
    });

  });

app.route("/login")
  .get(function(req, res) {
    res.render("login", logoutNavBar);
  })
  .post(passport.authenticate('local', {
    failureRedirect: "/login",
    failureFlash: "Invalid username or password."
  }), function(req, res) {
      req.login(req.user, function(err) {
        if(err) console.log(err) 
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

app.route("/apply")
.get(function(req, res) {
  if(req.isAuthenticated()) {
    res.render("apply", loginNavBar);
  } else {
    res.redirect("/login");
  }
})
.post(function (req, res) {
  let studentsName = req.body.student_name;
  let grades = req.body.grade;
  let info = {
    first_name: req.body.firstName,
    last_name: req.body.lastName,
    phone_number: req.body.phone,
    address: {
      street: req.body.street,
      floor: req.body.floor,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip
    }
  };

  let students = [];

  if(typeof studentsName === 'string') {
    let obj = {
      students_name: studentsName,
      grade: grades
    }
    students.push(obj);
  } else {
    studentsName.forEach((name, index) => {
      let obj= {
        students_name: name,
        grade: grades[index]
      };
      students.push(obj);
    });
  }

  User.updateOne({_id: req.user._id},
    {$set: { info: info, relations: students }},
    {multi: true}, function(err, user) {
      if(err) console.log(err);
      res.redirect('/personal');
  });

});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server listening on port is success.");
});
