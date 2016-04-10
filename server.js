var fs = require("fs");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
const crypto = require('crypto');

var Database = require("./lib/database");
var GameServer = require("./lib/game");

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Configuring mysql
var database = Database.connect(
  config.database_host,
  config.database_port,
  config.database_user,
  config.database_password,
  config.database_name
);
var UsersOnline = {};

var game = new GameServer(database);

// Configuring socket.io
io.set('origins', '*:'+config.port);
io.sockets.on("connection", function(socket) {

  function loginUser(username, email, password, callback) {
    var passwordhash = crypto.createHmac('sha256', password).digest('hex');
    database.login(username, email, passwordhash, function(status, userData) {
      if (status) {
        // controllo se l'utente è già collegato
        if (UsersOnline[userData.id] === undefined) {
          // login effettuato con successo
          console.log("loggato");
          UsersOnline[userData.id] = userData;
          socket.emit('login', {
            addedUser: true,
            userData: userData
          });
          socket.username = userData.username;
          socket.userId = userData.id;
          // console.log(UsersOnline);
          if (callback !== undefined) callback(userData);
        } else {
          // se è già connesso
          // console.log("il giocatore", userData.username, "è già collegato")
          socket.emit('login', {
            addedUser: false
          });
        }
        // se non è riuscito a loggarsi
      } else {
        // login fallito
        socket.emit('login', {
          addedUser: false
        });
      }
    });
  }

  //console.log("client connected");
  var addedUser = false;
  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (data) {
    var username = data.username, email = data.email, password = data.password;
    loginUser(username, email, password);
  });

  socket.on('logout', function(data) {
    if (socket.userId !== undefined) {
      console.log("logout", socket.username);
      UsersOnline[socket.userId] = undefined;
      socket.username = undefined;
      socket.userId = undefined;
      socket.emit('logout');
    } else {
      console.log("client leaving");
    }
  });

  socket.on('register user', function (data) {
    var username = data.username, email = data.email, password = data.password;
    // TODO controllare che la mail inserita sia una mail valida
    database.userExists(username, email, function(exists) {
      if (!exists) {
        // l'utente non esiste, può essere creato
        // Cripto la password
        var passwordhash = crypto.createHmac('sha256', password).digest('hex');
        database.createUser(username, email, passwordhash, function(status, userData) {
          console.log("Utente registrato: ", username, email);
          loginUser(username, email, password, function(loginData) {
            game.regalaCarte(loginData.id, 5, 2, 1);
          });
        });
      } else {
        // l'utente esiste già
        console.log("Impossibile registrare l'utente:", username, email);
      }
    });
  });

  socket.on('disconnect', function() {
    if (socket.userId !== undefined) {
      console.log("logout", socket.username);
      UsersOnline[socket.userId] = undefined;
      socket.username = undefined;
      socket.userId = undefined;
      socket.emit('logout');
    } else {
      console.log("client leaving");
    }
  });

  socket.on('cartePossedute', function () {
    if (socket.userId === undefined) {
      console.log("Utente non loggato.");
      return;
    }
    database.ottieniCarteUtente(socket.userId, function(status, carteData) {
      socket.emit('stampaPossedute', {
        carteData: carteData
      });
    });
  });

  socket.on('carteDeckPrimario', function () {
    if (socket.userId === undefined) {
      console.log("Utente non loggato.");
      return;
    }
    database.ottieniDeckPrimario(socket.userId, function(status, carteData) {
      socket.emit('carteDeckPrimario', {
        carteData: carteData
      });
    });
  });

  database.ottieniCarte(function() {});
});

// Configuring express
app.use("/", express.static(__dirname + '/public'));
server.listen(config.port, "0.0.0.0", function(){
  console.log("sciuar-royale is running on port", config.port);
});
