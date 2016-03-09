//dependencies

var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

//load the user model
var User = require('../app/models/user');

//load the auth variables
var configAuth = require('./auth');

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


  //FACEBOOK
  passport.use(new FacebookStrategy({
    clientID : configAuth.facebookAuth.clientID,
    clientSecret : configAuth.facebookAuth.clientSecret,
    callbackURL : configAuth.facebookAuth.callbackURL,
    profileFields : ["emails", "name"]
  },

  // facebook will send back the token and profile
  function(token, refreshToken, profile, done) {
       // asynchronous
     process.nextTick(function() {

         // find the user in the database based on their facebook id
         User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

             // if there is an error, stop everything and return that
             // ie an error connecting to the database
             if (err)
                 return done(err);

             // if the user is found, then log them in
             if (user) {
                 return done(null, user); // user found, return that user
             } else {
                 // if there is no user found with that facebook id, create them
                 var newUser            = new User();

                 // set all of the facebook information in our user model
                 newUser.facebook.id    = profile.id; // set the users facebook id
                 newUser.facebook.token = token; // we will save the token that facebook provides to the user
                 newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                 newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                 // save our user to the database
                 newUser.save(function(err) {
                     if (err)
                         throw err;

                     // if successful, return the new user
                     return done(null, newUser);
                 });
             }

         });
     });

   }));



   //TWITTER
   passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL

    },
    function(token, tokenSecret, profile, done) {
      console.log('TWITTER LOGIN');
        process.nextTick(function() {

            User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user, create them
                    var newUser                 = new User();

                    // set all of the user data that we need
                    newUser.twitter.id          = profile.id;
                    newUser.twitter.token       = token;
                    newUser.twitter.username    = profile.username;
                    newUser.twitter.displayName = profile.displayName;

                    // save our user into the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    //GOOGLE
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new User();

                    // set all of the relevant information
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));

};
