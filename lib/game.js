/**
* Shuffles array in place.
* @param {Array} a items The array containing the items.
*/
function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i -= 1) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
  return a;
}

function GameServer(database) {
  this.database = database;
  var self = this;
  this.aggiungiCassa = function(userId) {

  }

  this.regalaCarte = function(userId, normali, rare, epiche, callback) {
    self.database.ottieniCarte(function(carte) {

      var cont = normali + rare + epiche;
      var done = function() {
        cont--; if (cont <= 0) if (callback) callback(true);
      }

      shuffle(carte[0]);
      for (var i = 0; i < carte[0].length; i++) {
        if (i >= normali) break;
        self.database.aggiungiCartaAGiocatore(userId, carte[0][i].id, done);
      }
      shuffle(carte[1]);
      for (var i = 0; i < carte[1].length; i++) {
        if (i >= rare) break;
        self.database.aggiungiCartaAGiocatore(userId, carte[1][i].id, done);
      }
      shuffle(carte[2]);
      for (var i = 0; i < carte[2].length; i++) {
        if (i >= epiche) break;
        self.database.aggiungiCartaAGiocatore(userId, carte[2][i].id, done);
      }
    });
  }

  this.creaUtente = function(idUtente) {
    // creare 3 deck
    self.database.creaDeck(idUtente, 0);
    self.database.creaDeck(idUtente, 1);
    self.database.creaDeck(idUtente, 2);
    // regalare alcune carte
    self.regalaCarte(idUtente, 7, 2, 1, function(status) {
      // crea i vari deck
      self.database.ottieniCarteUtente(idUtente, function(result, data) {
        var carte = [];
        for (var i = 0; i < 8; i++) {
          if (data[i]) carte.push(data[i].id);
        }
        console.log(carte);
        self.database.impostaCarteDeck(idUtente, 0, carte);
        self.database.impostaCarteDeck(idUtente, 1, carte);
        self.database.impostaCarteDeck(idUtente, 2, carte);
      });
    });
  }
}

module.exports = GameServer;
