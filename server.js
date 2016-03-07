/*
  https://scotch.io/tutorials/easy-node-authentication-setup-and-local
  server.js bootstraps and glues the entire application
*/

//dependencies
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;


var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

//config
mongoose.connect(configDB.url); //connect to the DB

require('./config/passport')(passport); //pass passport for configuration

//set up the express app
app.use(morgan('dev')); //log every request to the console
app.use(cookieParser()); //read cookies (needed for auth)
app.use(bodyParser()); //get information from html forms

app.set('view engine', 'ejs'); //set up ejs for templating

//required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch'})); //session secret
app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions
app.use(flash()); //use connect-flash for flash messages stored in sessions

//routes
require('./app/routes.js')(app, passport); //load our routes and pass in the app and fully configured passport

//launch
app.listen(port, function(){
  console.log('App listening on port '+port);
});
