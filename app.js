//jshint esversion:6
///////////////////////////////Encryption using bcrypt///////////////////////////////////////////////////////////
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
//////////////////////////////////////////Setup our session///////////////////////////////////////////////
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
//////////////////////////////////////////passport initialize////////////////////////////////////////////////

app.use(passport.initialize());
app.use(passport.session());

//////////////////////////////////////////Database connection, Schema/////////////////////////////////////////////////////////////////////
mongoose.connect('mongodb://localhost:27017/UserDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);
var userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//////////////////////////////////////////passport-local-mongoose initialize////////////////////////////////////////////////
userSchema.plugin(passportLocalMongoose);

///////////////////////////////////mongoose model declaration/////////////////////////////////////////////////
var User = new mongoose.model("User", userSchema);

//////////////////////////////////// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"/////////////////////
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
////////////////////////////////////////////////Home route ///////////////////////////////////////////////////////
app.get("/", function(req, res) {
  res.render("home");
});

///////////////////////////////Login of existing users////////////////////////////////////////////////////////////
app.route("/login")
  .get(function(req, res) {
    res.render("login");
  })
  .post(function(req, res) {
    const user = new User({
      username :  req.body.username,
      password : req.body.password
    });
    req.login(user, function(err){
      if(err){
        console.log(err);
      } else {
        const auth =passport.authenticate("local");
        auth(req, res, function() {
          res.redirect("/secrets");
        });
      }
    })
  });


///////////////////////////////////Secrets Route///////////////////////////////////////////////////
app.route("/secrets").get(
  function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else {
      res.redirect("/login");
    }
  });
///////////////////////////////////Registeration of new users/////////////////////////////////////////////////////
app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    User.register({
      username: req.body.username
    }, req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/secrets");
          //console.log(req.user);
        });
      }
    });
  });
  ///////////////////////////////logout route////////////////////////////////////////////////////////////////////
  app.route("/logout").get(
    function(req, res){
      req.logout();
      res.redirect("/");
    });

///////////////////////////////Submit route////////////////////////////////////////////////////////////////////
    app.route("/logout").get(
      function(req, res){
        req.logout();
        res.redirect("/");
      });
///////////////////////////////Server listening////////////////////////////////////////////////////////////////////
app.listen(3000, function(req, res) {
  console.log("Server up at port 3000!");
})
