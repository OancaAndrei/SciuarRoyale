var deckPrimario = [];
var deckSecondario = [];
var deckTerziario = [];

var tempdeckPrimario = [];
var tempdeckSecondario = [];
var tempdeckTerziario = [];

$(function() {

  // $("#btnLogout").click(function() {
  //   socket.emit('logout');
  // });
  //
  // $("#registerUser").click(function() {
  //   $(".login").hide();
  //   $(".register").fadeIn();
  // });
  //
  $("#btnSave").on('click', function() {
    if (tempdeckPrimario.length !== 8) {
      alert("Selezionare 8 carte per il deck primario!");
      return;
    }
    if (tempdeckSecondario.length !== 8) {
      alert("Selezionare 8 carte per il deck secondario!");
      return;
    }
    if (tempdeckTerziario.length !== 8) {
      alert("Selezionare 8 carte per il deck terziario!");
      return;
    }
    socket.emit('impostaCarteDeck', {ordine: 0, carte: tempdeckPrimario});
    socket.emit('impostaCarteDeck', {ordine: 1, carte: tempdeckSecondario});
    socket.emit('impostaCarteDeck', {ordine: 2, carte: tempdeckTerziario});
  });

  socket.on('carteDeck', function(data) {
    var deck = "";
    var currentDeck = [];
    var tempcurrentDeck = [];
    if (data.ordine === 0) {
      deck = ".ModificaDeckPrimario";
      deckPrimario = [];
      tempdeckPrimario = [];
      for (var i = 0; i < data.carteData.length; i++) {
        deckPrimario.push(data.carteData[i].id);
        tempdeckPrimario.push(data.carteData[i].id);
      }
      currentDeck = deckPrimario;
      tempcurrentDeck = tempdeckPrimario;
    } else if (data.ordine === 1) {
      deck = ".ModificaDeckSecondario";
      deckSecondario = [];
      tempdeckSecondario = [];
      for (var i = 0; i < data.carteData.length; i++) {
        deckSecondario.push(data.carteData[i].id);
        tempdeckSecondario.push(data.carteData[i].id);
      }
      currentDeck = deckSecondario;
      tempcurrentDeck = tempdeckSecondario;
    } else if (data.ordine === 2) {
      deck = ".ModificaDeckTerziario";
      deckTerziario = [];
      tempdeckTerziario = [];
      for (var i = 0; i < data.carteData.length; i++) {
        deckTerziario.push(data.carteData[i].id);
        tempdeckTerziario.push(data.carteData[i].id);
      }
      currentDeck = deckTerziario;
      tempcurrentDeck = tempdeckTerziario;
    } else {
      return;
    }

    $(deck).html("");
    for (var i = 0; i < cartePossedute.length; i++) {
      var carta = cartePossedute[i];
      var selected = (currentDeck.indexOf(carta.id) !== -1);
      var immagineCarta = $("<img class='carta' src='/img/Carte/" + carta.id + ".png'></img>");
      if (selected) {
        immagineCarta.addClass("selected");
      } else {
        immagineCarta.addClass("unselected");
      }
      immagineCarta.data("carta", carta);
      immagineCarta.on('click', function() {
        $(this).toggleClass("selected");
        $(this).toggleClass("unselected");
        var selected = $(this).hasClass("selected");
        var carta = $(this).data("carta");
        if (selected) {
          tempcurrentDeck.push(carta.id);
        } else {
          var index = tempcurrentDeck.indexOf(carta.id);
          if (index !== -1) {
            tempcurrentDeck.splice(index, 1);
          }
        }

        console.log(tempcurrentDeck);
      });
      $(deck).append(immagineCarta);
    }
  });
});
