const sqlConnection = require('../db').connection;

exports.getListOfTypeInUsers = function (req, res) {
  const typedInUser = req.query.typedInUser;
  const queryString = `SELECT ID, fullName, email from tblUser where fullName like '%'${JSON.stringify(typedInUser)}'%'`;
  sqlConnection.query(queryString, function(err, results){
    if (err) {
      console.log('error in dbOperations Line 8', err);
      res.json({fullName: ''});
    } else {
      if (results.length > 0) {
        var arr = [];
        for (var i = 0; i < results.length; i++) {
          arr.push({
            ID: results[i].ID,
            email: results[i].email,
            fullName: results[i].fullName,
            display: results[i].fullName + '-' + results[i].email
          })
        }
        console.log(arr);
        res.json(arr);
      } else {
        const user = {ID:0, email:'', fullName:'', display:''};
        const arr = [user];   
        res.json(arr);
      }
    }
  });
}