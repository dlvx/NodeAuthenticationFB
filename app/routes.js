module.exports = function(app, passport){

  //Home Page with login links
  app.get('/', function(req, res){
    res.render('index.ejs');
  });

  //Login with login form
  app.get('/login', function(req, res){
    //render the page and pass in any flash data if it exists
    res.render('login.ejs', { message : req.flash('loginMessage')});
  });

  //process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
  }));

  //Signup with signup form
  app.get('/signup', function(req, res){
    //render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message : req.flash('signupMessage')});
  });

  //process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', //redirect to the secure profile section
    failureRedirect : '/signup', //redirect back to the signup page if there is an error
    failureFlash : true //allow flash messages
  }));

  /*----------------------------------------------------------------------------
    There is also much more you can do with this. Instead of specifying a
    successRedirect, you could use a callback and take more control over how
    your application works. Here is a great stackoverflow answer on error
    handling. It explains how to use done() and how to be more specific with
    your handling of a route.

    http://stackoverflow.com/questions/15711127/express-passport-node-js-error-handling
  ----------------------------------------------------------------------------*/

  //Profile page
  //we want this protected so the user has to be logged in to visit the pagge
  //we will use route middleware (the isLoggedIn function) to verify this
  app.get('/profile', isLoggedIn, function(req, res){
    res.render('profile.ejs', {
      user : req.user //get the user out of session and pass to template
    });
  });



  /*
    Facebook Routes
  */
  // route for facebook authentication and login
  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
  /*
    By default, Facebook will provide you with user information, but not the email address.
    We will add this by specifying the scope. You can also add in more scopes to access more information.
  */

  //handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
    }));

  //Logout
  app.get('/logout', function(req, res){
    req.logout(); //req.logout() is provided by passport
    res.redirect('/');
  });
};

//route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  //if user is authenticated in the session, carry on
  if(req.isAuthenticated())
    return next();

  //if no user is authenticated, redirect to home page
  res.redirect('/');
}
