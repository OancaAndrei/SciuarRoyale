var mysql = require('mysql');

function DatabaseConnection(connection) {
  var self = this;
  this.connection = connection;

  var queries = {
    login: "SELECT * FROM tblUtenti WHERE (username = ? OR email = ?) AND password = ?",
    CartePossedute: "SELECT * FROM tblCartePossedute WHERE idUtente = ?"
  };

  this.login = function(username, email, password, callback) {
    var query = connection.query(queries.login, [username, email, password], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          delete result[0].password; // la password è segreta, meglio non mostrarla in giro
          console.log(result[0]);
          callback(true, result[0]);
        } else {
          callback(false, undefined);
        }
      } else {
        console.log("Wrong query:", this.sql);
      }
    });
  }
  //
// Stampa Tutte le carte possedute
  this.CartePossedute = function(idUtente, callback) {
    var query = connection.query(queries.CartePossedute, [idUtente], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          console.log(result[0]);
          callback(true, result[0]);
        } else {
          callback(false, undefined);
        }
      } else {
        console.log("Wrong query:", this.sql);
      }
    });
  }

}

var Database = {};

Database.connect = function(host, port, user, password, database, callback) {
  console.log("Connecting to mysql:", host, port);
  // Configuring mysql
  var connection = mysql.createConnection({
    host : host,
    port : port,
    user : user,
    password : password,
    database : database
  });
  connection.connect(function(error) {
    if (error) {
      console.error("error connecting to mysql");
      return;
    }
    console.log("connected to mysql");
  });

  var databaseConnection = new DatabaseConnection(connection);

  return databaseConnection;
}

module.exports = Database;
