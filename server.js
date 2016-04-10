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
var StanzaAttesa = [];

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
          socket.trofei = userData.trofei;
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

  socket.on('logout', function() {
    // se si strova nella stanza di attesa lo elimino
    if (socket.userId !== undefined) {
      var index = StanzaAttesa.indexOf(socket.userId);
      if (index > -1) {
        StanzaAttesa.splice(index, 1);
      }
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
            game.creaUtente(loginData.id);
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
      // se si strova nella stanza di attesa lo elimino
      var index = StanzaAttesa.indexOf(socket.userId);
      if (index > -1) {
        StanzaAttesa.splice(index, 1);
      }
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

  socket.on('carteDeck', function (data) {
    if (socket.userId === undefined) {
      console.log("Utente non loggato.");
      return;
    }
    database.ottieniDeck(socket.userId, data.ordine, function(status, carteData) {
      socket.emit('carteDeck', {
        ordine: data.ordine,
        carteData: carteData
      });
    });
  });

  socket.on('stanzaAttesa', function () {
    StanzaAttesa.push(socket.userId)
    console.log(socket.trofei)
    var trofeiMin = socket.trofei -100
    if(trofeiMin < 0){trofeiMin = 0}
    var trofeiMax = socket.trofei +100
    database.cercaAvversario(trofeiMin,trofeiMax, function(status, possibiliAvversari) {
      for(var y = 0; y<StanzaAttesa.length;y++)
      {
        for(var i = 0; i<possibiliAvversari.length; i++)
        {
          // se trovo i giocatori
          if((possibiliAvversari[i].id == StanzaAttesa[y]) && (socket.userId != StanzaAttesa[y])){
            var idAvversario = StanzaAttesa[y];
            console.log("Ora inizia lo scontro tra "+socket.userId+" e "+ idAvversario)
            // elimino i due giocatori dalla sala d'attesa
            var index = StanzaAttesa.indexOf(socket.userId);
            if (index > -1) {
              StanzaAttesa.splice(index, 1);
            }
            var index = StanzaAttesa.indexOf(StanzaAttesa[y]);
            if (index > -1) {
              StanzaAttesa.splice(index, 1);
            }
            var partita = SvoglimentoPartita(socket.userId,idAvversario);
            database.esitoBattaglia(partita.vincitore,partita.sconfitto,partita.trofeiVincitore,partita.trofeiSconfitto, function(status) {});
            database.inserisciTrofei(partita.trofeiVincitore,partita.vincitore, function(status) {});
            database.inserisciTrofei(partita.trofeiSconfitto,partita.sconfitto, function(status) {});
            console.log(partita)
            socket.emit('Partita', {

            });
          }
        }
      }
    });
  });

  socket.on('EsciStanzaAttesa', function () {
    var index = StanzaAttesa.indexOf(socket.userId);
    if (index > -1) {
      StanzaAttesa.splice(index, 1);
    }
  });

  function SvoglimentoPartita(id,idAvversario){
    var partita ={}
    var casuale = Math.floor((Math.random() * 2) + 1);
    var trofei = Math.floor((Math.random() * 10) + 20);
    partita.trofeiVincitore = trofei;
    partita.trofeiSconfitto = 0-trofei;
    if(casuale == 1)
    {
      partita.vincitore = id
      partita.sconfitto = idAvversario
    }
    if(casuale == 2)
    {
      partita.vincitore = idAvversario
      partita.sconfitto = id
    }
    return partita
  }

  socket.on('impostaCarteDeck', function (data) {
    if (socket.userId === undefined) {
      console.log("Utente non loggato.");
      return;
    }
    if (data.ordine === undefined || data.carte === undefined || data.carte.length !== 8) {
      return;
    }
    database.ottieniIdDeck(socket.userId, data.ordine, function(idDeck) {
      database.pulisciDeck(socket.userId, idDeck, function(status) {
        if (status) {
          for (var i = 0; i < data.carte.length; i++) {
            database.aggiungiCartaADeck(socket.userId, data.carte[i], idDeck);
          }
        } else {
          console.log("errore nel pulire il deck");
        }
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
