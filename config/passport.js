//dependencies

var LocalStrategy = require('passport-local').Strategy;

//load the user model
var User = require('../app/models/user');

//expose this function to our app using module.exports
module.exports = function(passport){
  //passport session setup
  //required for persistent login sessions
  //passport needs the ability to serialize and deserialize users out of session


  //In this example, only the user ID is serialized to the session, keeping the amount of data stored within the session small.
  //When subsequent requests are received, this ID is used to find the user, which will be restored to req.user.
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });


  //Local Signup Strategy
  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done){
    //async
    //User.findOne wont fire unless data is sent back
    process.nextTick(function(){

      //find a user whose email is the same as the form's submitted email
      //we are checking if the user trying to login already exists
      User.findOne({'local.email' : email }, function(err, user){
        if(err)
          return done(err);

        //check if there's already a user with that email
        if(user){
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }else{
          //if there is no user with that email
          //create the user
          var newUser = new User();

          //set the user's local credentials
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);

          //save the user
          newUser.save(function(err){
            if(err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));


  //Local Login Strategy
  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, email, password, done){
    //find a user whose email is the same as the form's email
    //we are checking if the user trying to login already exists
    User.findOne({ 'local.email' : email }, function(err, user){
      if(err)
        return done(err);
      //if no user is found return the message
      if(!user)
        return done(null, false, req.flash('loginMessage', 'No user found.'));

      //if the user is found but the password is wrong
      if(!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong Password.'));

      //if everything is ok, return successful user
      return done(null, user);
    });
  }));
  
};
