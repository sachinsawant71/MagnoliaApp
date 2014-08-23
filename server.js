var express =       require('express')
    , http =        require('http')
    , passport =    require('passport')
    , path =        require('path')
    , expressSession = require('express-session')
    , User =        require('./server/models/User.js');

var multer = require('multer');

var app = module.exports = express();

app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');


app.use(require('body-parser')());
app.use(require('morgan')('dev'));
app.use(require('errorhandler')())

app.use(express.static(__dirname + '/public'));           // set static files directory
app.use(multer({ dest: './public/uploads/',
	rename: function(fieldname, filename) {
		return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
	}
}));

app.use(require('method-override')());
app.use(express.static(path.join(__dirname, 'client')));
app.use(require('cookie-parser')());
  
app.use(expressSession({
		secret: process.env.COOKIE_SECRET || "Superdupersecret",
		cookie: {
			httpOnly: true
		}
}));
 
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.localStrategy);
//passport.use(User.twitterStrategy());  // Comment out this line if you don't want to enable login via Twitter
//passport.use(User.facebookStrategy()); // Comment out this line if you don't want to enable login via Facebook
//passport.use(User.googleStrategy());   // Comment out this line if you don't want to enable login via Google
//passport.use(User.linkedInStrategy()); // Comment out this line if you don't want to enable login via LinkedIn

passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);


require('./server/routes.js')(app);

app.set('port', process.env.PORT || 8000);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});