const passport = require('passport');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt-nodejs');
const sqlConnection = require('../db').connection;

const localLogin = new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {

  const queryStr = 'select ID, email, password, fullName from tblUser where email = '+ JSON.stringify(email) + ';';

  sqlConnection.query(queryStr, function(error, results){
    if (error) {
      return done({ error:`An error has ocured while retreiving email: ${error}` });
    } else {
      if (results.length === 0) {
        return done(null, false);
      } else {
        const isMatch = bcrypt.compareSync(password, results[0].password);
        if (isMatch) {
          const user = {
            ID: results[0].ID,
            email: results[0].email,
            fullName: results[0].fullName
          }
          return done(null, user);
        } else {
          return done(null, false);
        }
      }
    }
  });
});


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done){
  const queryStr = 'select ID, email, password, fullName from tblUser where ID = ' + payload.sub + ';';
  sqlConnection.query(queryStr, function(error, results){
    if (error) {
      return done({ error:`An error has ocured while retreiving ID: ${error}` });
    } else {
      if (results.length === 0) {
        return done(null, false);
      } else {
        const user = {
          ID: results[0].ID,
          email: results[0].email,
          fullName: results[0].fullName
        }
        return done(null, user);
      }
    }
  });
});

passport.use(jwtLogin);
passport.use(localLogin);