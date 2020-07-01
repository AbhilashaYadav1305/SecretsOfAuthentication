//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require ("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/UserDb', {useNewUrlParser: true ,  useUnifiedTopology: true });

var userSchema =  new mongoose.Schema({
    email : String,
    password: String
  });

///////////////////////////////Encryption using plugin///////////////////////////////////////////////////////////
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

var User = new mongoose.model("User",userSchema);
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
  const password = req. body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        }
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
  //Creating a database entry of a new user
  const  newUser= new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

///////////////////////////////Server listening////////////////////////////////////////////////////////////////////
app.listen(3000, function(req, res){
  console.log("Server up at port 3000!");
})
