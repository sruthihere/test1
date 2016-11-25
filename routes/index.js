var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var flash    = require('connect-flash');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Login App',
      });
});

/* GET LOGIN page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login',
                        message: req.flash('loginmessage')
                      
           });
});


/* GET REGISTRATION page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register',
                           errors : ''
           });
});


/* POST REGISTRATION page. */
router.post('/register', function(req, res, next) {
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;


	//Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'password is required').notEmpty();
  req.checkBody('password2', 'passwords do not match').equals(req.body.password);

  	var errors = req.validationErrors();

  	if(errors){
      console.log("error exists");
       	res.render('register',{
  			errors : errors,
  			title: 'Register'
  		});
  	}else{
      console.log("passed");
  		var newUser = new User({
        name : name,
        email : email,
        username : username,
        password : password
      });

      User.createUser(newUser, function(err, user){
        if(err) {throw err;}
        console.log(user);

      });

      req.flash('loginmessage', 'You are registered and can now login');
      res.redirect('/login');  


    }
  	
});



/* Strategy */
passport.use(new LocalStrategy(
  function ( username, password, done) {
    User.getUserByUsername(username, function (err, user){
      if (err) throw err;
      if(!user){
         return done(null, false, { message: 'Incorrect username'});
  
         }
      User.comparePasswords( password, user.password, function ( err, isMatch){
        if (err) throw err;
        if(isMatch){
          return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password'});
          
        }//else 
      });//comparePasswords
    });
  })); 





/*Serialize and de-serialize*/
passport.serializeUser(function(user, done) {
   done(null, user.id);
});

// Deserialize the user
passport.deserializeUser(function(id, done) {
 User.getUserById(id, function(err, user) {
  done(err, user);
    });
});

/* POST LOGIN page. */
router.post('/login',passport.authenticate('local',{
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page 
    failureFlash : true // allow flash messages
  
  }),
 function(req, res) {
    res.redirect('/');
  });





/* GET LOGOUT page. */
router.get('/logout', function(req, res, next) {
    req.logout();
    req.flash('loginmessage', 'You have successfully logged out');
    res.redirect('/login');
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
    return next();
  else
    res.redirect('/');
}

module.exports = router;


