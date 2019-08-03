const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

//renders public files(css or images)
app.use("/public", express.static(__dirname + '/public'));

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/signup", function(req, res) {
  res.render("signup");
});

app.post("/signup", function(req, res) {
  console.log("backend not loaded yet!")
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  console.log("backend not loaded yet!")
});

app.get("/contact", function(req,  res) {
  // console.log(req.query.origin);
  
  res.render("contact");
  
});

app.listen(3000, function() {
  console.log("Server is listening on port 3000.");
});