var fs = require("fs");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

var Database = require("./lib/database")

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

// Configuring socket.io
io.set('origins', '*:'+config.port);
io.sockets.on("connection", function(socket) {
  //console.log("client connected");
  var addedUser = false;
  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (data) {
    var username = data.username, email = data.email, password = data.password;
    database.login(username, email, password, function(status, userData) {
      if (status) {
        // controllo se l'utente è già collegato
        if (UsersOnline[userData.id] === undefined) {
          // login effettuato con successo
          console.log("loggato");
          UsersOnline[userData.id] = userData;
          database.CartePossedute(userData.id, function(status, CarteData) {
          socket.emit('login', {
            addedUser: true,
            userData: userData,
            CarteData: CarteData
          });
          });
          socket.username = userData.username;
          socket.userId = userData.id;
          console.log(UsersOnline);
        } else {
          // se è già connesso
          console.log("il giocatore", userData.username, "è già collegato")
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
});

// Configuring express
app.use("/", express.static(__dirname + '/public'));
server.listen(config.port, "0.0.0.0", function(){
  console.log("sciuar-royale is running on port", config.port);
});
