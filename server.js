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
  user : config.database_user,
  password : config.database_password,
  database : config.database_name
});
connection.connect(function(error) {
  if (error) {
    console.error("error connecting to mysql");
    return;
  }
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
