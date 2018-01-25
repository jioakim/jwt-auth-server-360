const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const passport = require('passport');
const passportService = require('./services/passport'); // only for passport.use
const dbOperations = require('./services/dbOperations');
const Authentication = require('./controllers/authentication');

const requireAuth = passport.authenticate('jwt', { session: false});
const requireSignin = passport.authenticate('local', { session: false });


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
// app.use(morgan('combined'));

var router = express.Router();

//generic routes
router.route('/').get(requireAuth, function(req, res){
  res.send({ message: 'super secret code is abcD3', user: req.user });
});
router.route('/signin').post(requireSignin, Authentication.signin);
router.route('/signup').post(Authentication.signup);

//db operations routes
router.route('/search/typed-user').get(requireAuth, dbOperations.getListOfTypeInUsers);

app.use(router);
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.timeout = 0;
server.listen(port, function(){
  console.log('server is listening on port ' + port);
});
