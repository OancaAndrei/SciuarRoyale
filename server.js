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
var UsersOnline = [];

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
        if( UsersOnline.indexOf(userData.id) == -1){
          // login effettuato con successo
          cosnole.log("loggato")
          UsersOnline.push(userData.id)
          socket.emit('login', {
            addedUser: true,
            userData: userData
          });
          socket.username = username;
          // se è già connesso
        }else {
          console.log("il giocatore", username, "è già collegato")
          socket.emit('login', {
            addedUser: false
          });
        }
        // se non è riuscito a loggarsi
      }else {
        // login fallito
        socket.emit('login', {
          addedUser: false
        });
      }
      console.log("login", username, status);
      console.log(UsersOnline);
    });
  });
});

// Configuring express
app.use("/", express.static(__dirname + '/public'));
server.listen(config.port, "0.0.0.0", function(){
  console.log("sciuar-royale is running on port", config.port);
});
