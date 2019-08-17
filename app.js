//jshint esversion:6
require('dotenv').config();
const express     = require("express");
const ejs         = require("ejs");
const bodyParser  = require("body-parser");
const mongoose    = require("mongoose");
const session     = require("express-session");
const passport    = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const helmet      = require("helmet");
const nodemailer  = require("nodemailer");
const flash       = require("connect-flash");

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
  saveUninitialized: false
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
mongoose.connect("mongodb://localhost:27017/academyUsersDB", {useNewUrlParser: true}); 
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
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

userSchema.plugin(passportLocalMongoose) //save users into mongodb with hash and salt using passport

const User = new mongoose.model("users", userSchema) //create model collection "users"

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser()); //serialize id; keep track of id
passport.deserializeUser(User.deserializeUser()); //deserialize id; makes a request to DB to find profile information

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

app.listen(3000, function() {
  console.log("Server is listening on port 3000.");
});


    // async function main() {
    //   let from = process.env.SMTP_USER,
    //     to = process.env.SMTP_USER,
    //     subject = `Welcome to Rising Academy`;

    //   let transporter = nodemailer.createTransport({
    //     host: process.env.HOSTNAME,
    //     secureConnection: true,
    //     port: 465,
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASSWORD
    //     }
    //   });

    //   // send mail with defined transport object
    //   let info = await transporter.sendMail({
    //     from: from, // sender address
    //     to: to, // list of receivers
    //     subject: subject, // Subject line
    //     text: "Hello world?", // plain text body
    //     html: "<b>Click the link to verify your email</b>" // html body
    //   });

    //   console.log("Message sent: %s", info.messageId);
    //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // }

    // main().catch(console.error);