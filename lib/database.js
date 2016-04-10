var fs = require("fs");
var mysql = require('mysql');

function DatabaseConnection(connection) {
  var self = this;
  this.connection = connection;

  var queries = JSON.parse(fs.readFileSync('./lib/queries.json', 'utf8'));

  this.login = function(username, email, password, callback) {
    var query = connection.query(queries.login, [username, email, password], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          delete result[0].password; // la password è segreta, meglio non mostrarla in giro
          console.log(result[0]);
          if (callback !== undefined) callback(true, result[0]);
        } else {
          if (callback !== undefined) callback(false, undefined);
        }
      } else {
        console.log("Wrong query:", this.sql);
      }
    });
  }

  this.userExists = function(username, email, callback) {
    var query = connection.query(queries.userExists, [username, email], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          if (callback !== undefined) callback(true); // l'utente esiste già
        } else {
          if (callback !== undefined) callback(false); // l'utente non esiste
        }
      } else {
        console.log("Wrong query:", this.sql);
      }
    });
  }

  this.createUser = function(username, email, password, callback) {
    var query = connection.query(queries.createUser, [username, password, email], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        console.log(result);
        if (result.length > 0) {
          console.log(result[0]);
          if (callback !== undefined) callback(true, result[0]);
        } else {
          if (callback !== undefined) callback(false, undefined);
        }
      } else {
        console.log("Wrong query:", this.sql);
      }
    });
  }

  // Stampa Tutte le carte possedute
  this.ottieniCarteUtente = function(idUtente, callback) {
    var query = connection.query(queries.cartePossedute, [idUtente], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          if (callback !== undefined) callback(true, result);
        } else {
          if (callback !== undefined) callback(false, undefined);
        }
      } else {
        console.log("Wrong query:", this.sql);
      }
    });
  }

  // Ottiene le carte che compongono il deck primario
  this.ottieniDeckPrimario = function(idUtente, callback) {
    var query = connection.query(queries.carteDeck, [idUtente, 0], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          if (callback !== undefined) callback(true, result);
        } else {
          if (callback !== undefined) callback(false, undefined);
        }
      } else {
        console.log("Wrong query:", this.sql);
      }
    });
  }

  // Ottieni tutte le carte del gioco
  this.ottieniCarte = function(callback) {
    var query = connection.query(queries.carte, function(err, result) {
      if (result !== undefined) {
        var carte = {};

        for (var i = 0; i < result.length; i++) {
          var carta = result[i];
          if (carte[carta.tipoRarita] === undefined) carte[carta.tipoRarita] = [];
          carte[carta.tipoRarita].push(carta);
        }
        console.log(carte);
        if (callback !== undefined) callback(carte);
      }
    });
  }

  this.aggiungiCartaAGiocatore = function(userId, idCarta, callback) {
    var query = connection.query(queries.aggiungiCartaAGiocatore, [idCarta, userId], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          if (callback !== undefined) callback(true);
        } else {
          if (callback !== undefined) callback(false);
        }
      }
    });
  }

  this.cercaAvversario = function(trofeiMin,trofeiMax, callback) {
    var query = connection.query(queries.cercaAvversario, [trofeiMin,trofeiMax], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          if (callback !== undefined) callback(true, result);
        } else {
          if (callback !== undefined) callback(false, undefined);
        }
      }
    });
  }

 this.esitoBattaglia = function(vincitore,sconfitto,trofeiVincitore,trofeiSconfitto, callback) {
    var query = connection.query(queries.esitoBattaglia, [vincitore,sconfitto,trofeiVincitore,trofeiSconfitto], function(err, result) {
      if (result !== undefined) { // nessun errore nella query
        console.log("Query:", this.sql);
        if (result.length > 0) {
          if (callback !== undefined) callback(true);
        } else {
          if (callback !== undefined) callback(false);
        }
      }
    });
  }

  this.inserisciTrofei = function(trofei,id, callback) {
     var query = connection.query(queries.inserisciTrofei, [trofei,id], function(err, result) {
       if (result !== undefined) { // nessun errore nella query
         console.log("Query:", this.sql);
         if (result.length > 0) {
           if (callback !== undefined) callback(true);
         } else {
           if (callback !== undefined) callback(false);
         }
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
