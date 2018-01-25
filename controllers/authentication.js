const jwt = require('jwt-simple');
const config = require('../config');
const bcrypt = require('bcrypt-nodejs');
const sqlConnection = require('../db').connection;

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.ID, iat: timestamp }, config.secret);
}

exports.signup = function(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  const fullName = req.body.fullName;

  if (!email || !password || !fullName) {
    return res.status(422).send({ error:'You must provide email, password and full name' });
  }

  const queryStr1 = 'select ID from tblUser where email = '+ JSON.stringify(email) + ';';
  const hash = bcrypt.hashSync(password);
  sqlConnection.query(queryStr1, function(error, results){
    if (error){
      res.status(422).send({ error:`An error has ocured while retrieving emails: ${error}` });
    } else {
      if (results.length > 0) {
        res.status(422).send({ error: `Email in use` });
      } else {
        const queryStr2 = `INSERT INTO johndb_aws_1.tblUser (email, password, fullName) VALUES
        (${JSON.stringify(email)}, ${JSON.stringify(hash)}, ${JSON.stringify(fullName)});`
        sqlConnection.query(queryStr2, function(error, results){
          if (error) {
            res.status(422).send({ error:`An error has ocured while inserting new user: ${error}` });
          } else {
            var user = {};
            user.ID = results.insertId;
            user.email = email,
            user.fullName = fullName;
            res.json({ token: tokenForUser(user), user });
          }
        });
      }
    }
  });

}

exports.signin = function(req, res, next) {
  var user = {
    ID: req.user.ID,
    email: req.user.email,
    fullName: req.user.fullName
  }
  res.send({ token: tokenForUser(req.user), user });
}