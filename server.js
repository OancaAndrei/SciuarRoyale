var fs = require('fs');
var mysql = require('mysql');

var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Configuring mysql
var connection = mysql.createConnection({
  host : config.database_host,
  port : config.database_port,
  user : config.database_user,
  password : config.database_password,
  database : config.database_name
});
connection.connect(function(error) {
  if (error) {
    console.error("error connecting to mysql");
    return;
  }
  console.log("connected to mysql");
});

// Configuring socket.io
io.set('origins', '*:'+config.port);
io.sockets.on("connection", function(socket) {
  console.log("client connected");
});

// Configuring express
app.use("/", express.static(__dirname + '/public'));
server.listen(config.port, "0.0.0.0", function(){
  console.log("sciuar-royale is running on port", config.port);
});

io.on('connection', function (socket) {
  var addedUser = false;

// when the client emits 'add user', this listens and executes
socket.on('add user', function (username) {
  socket.username = username;
  // Sostituire con query che si interfaccia al database
  if(socket.username == "timur" )
  {
  //  usernames[username] = username;
  //  ++numUsers;
    addedUser = true;
    var messaggio = username+" si è collegato";
    console.log(messaggio);
  }
  socket.emit('login', {
    addedUser: addedUser
  });

});
});
