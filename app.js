//jshint esversion:6
///////////////////////////////Encryption using bcrypt///////////////////////////////////////////////////////////
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require ("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
 //////////////////////////////////////////Database connection, Schema/////////////////////////////////////////////////////////////////////
mongoose.connect('mongodb://localhost:27017/UserDb', {useNewUrlParser: true ,  useUnifiedTopology: true });

var userSchema =  new mongoose.Schema({
    email : String,
    password: String
  });

 var User = new mongoose.model("User",userSchema);
 /////////////////////////////////////////////bcrypt salt rounds//////////////////////////////////////////////////////////////////
 const saltRounds = 10;

////////////////////////////////////////////////Home route ///////////////////////////////////////////////////////
app.get("/", function(req, res){
  res.render("home");
});

///////////////////////////////Login of existing users////////////////////////////////////////////////////////////
app.route("/login")
.get(function(req, res){
  res.render("login");
})
.post(function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        //Comparing bcrypt password with userpassword while log in
        bcrypt.compare(password, foundUser.password, function(err, result) {
            if(result === true){
              res.render("secrets");
            }
        });
        }
      }
    });
});

///////////////////////////////////Registeration of new users/////////////////////////////////////////////////////
app.route("/register")
.get(function(req, res){
  res.render("register");
})
.post(function(req, res){

  //Using bcrypt to hash password using saltround.
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      //Creating a database entry of a new user
    const  newUser= new User({
      email: req.body.username,
      password: hash
    });
    newUser.save(function(err){
      if(err){
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
  });
});

///////////////////////////////Server listening////////////////////////////////////////////////////////////////////
app.listen(3000, function(req, res){
  console.log("Server up at port 3000!");
})
