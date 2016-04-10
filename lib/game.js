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

  this.regalaCarte = function(userId, normali, rare, epiche) {
    self.database.ottieniCarte(function(carte) {
      shuffle(carte[0]);
      for (var i = 0; i < carte[0].length; i++) {
        if (i >= normali) break;
        self.database.aggiungiCartaAGiocatore(userId, carte[0][i].id);
      }
      shuffle(carte[1]);
      for (var i = 0; i < carte[1].length; i++) {
        if (i >= rare) break;
        self.database.aggiungiCartaAGiocatore(userId, carte[1][i].id);
      }
      shuffle(carte[2]);
      for (var i = 0; i < carte[2].length; i++) {
        if (i >= epiche) break;
        self.database.aggiungiCartaAGiocatore(userId, carte[2][i].id);
      }
    });
  }
}

module.exports = GameServer;
