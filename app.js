const express = require("express");
const ejs = require("ejs")

const app = express();

app.set("view engine", "ejs")

//renders public files(css or images)
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render("home");
});

app.listen(3000, function() {
  console.log("Server is listening on port 3000.");
});