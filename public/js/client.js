var socket = io();
var cartePossedute = [];

$(function() {

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $passwordInput = $('.passwordInput'); // Input for password
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login'); // The login page
  var $userHomePage = $('.userhome');
  var $creaMazzo = $('.creamazzo');
  var $Battaglia = $('.battaglia');
  var $risultati = $('.risultati');

  var loginForm = $('.login-form');
  var logoutForm = $('.logout-form');

  // Prompt for setting a username
  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();
  var id;
  var UserData = {}

  // Sets the client's username
  $("#btnLogin").click(function() {
    username = $usernameInput.val().trim();
    password = $passwordInput.val();
    // If the username is valid
    if (username && password) {
      // Tell the server your username
      socket.emit('add user', {username : username, email: username, password : password});
    }
  });

  $("#btnLogout").click(function() {
    socket.emit('logout');
  });

  $("#registerUser").click(function() {
    $(".login").hide();
    $(".register").fadeIn();
  });

  $("#btnRegister").click(function() {
    username = $(".usernameInputRegister").val().trim();
    email = $(".emailInputRegister").val().trim();
    password1 = $(".password1InputRegister").val().trim();
    password2 = $(".password2InputRegister").val().trim();
    console.log(username, email, password1, password2);
    if (username && email && password1 && (password1 === password2)) {
      socket.emit('register user', {username : username, email: email, password : password1});
    }
  });

  socket.on('login', function(data) {
    console.log(data.addedUser);
    console.log(data.userData);
    // Se il login è avvenuto con successo
    if(data.addedUser == true)
    {
      userData = data.userData;
      id = data.userData.id
      $loginPage.hide();
      $userHomePage.fadeIn();
      //  $loginPage.off('click');

      $("#registerUser").hide();
      $(".register").hide();
      loginForm.hide();
      logoutForm.show();

      //Stampa le cose sulla home page
      $(".name").text(data.userData.username);
      $(".money").text(data.userData.monete);
      $(".esperienza").text(data.userData.esperienza);
      $(".level").text("Lv: "+data.userData.livello);
      $(".trofei").text(data.userData.trofei);
      //  $(".welcome-message").text("Bentornato, " + data.userData.username + "!");
      // Richiedi carte deck primario
      socket.emit('carteDeck', {ordine: 0});
    }
    else {
      alert("Username o password errati");
    }

  });

  socket.on('logout', function() {
    logoutForm.hide();
    loginForm.show();
    $userHomePage.hide();
    $creaMazzo.hide();
    $Battaglia.hide();
    $partita.hide();
    $loginPage.fadeIn();
    $("#registerUser").fadeIn();
  });

  $("#btnCreaMazzo").click(function() {
    $userHomePage.hide();
    $creaMazzo.fadeIn();
    socket.emit('cartePossedute');
    socket.emit('carteDeck', {ordine: 0});
    socket.emit('carteDeck', {ordine: 1});
    socket.emit('carteDeck', {ordine: 2});
  });

  $("#btnMenu").click(function() {
    $creaMazzo.hide();
    $userHomePage.fadeIn();
  });

  socket.on('stampaPossedute', function(data) {
    cartePossedute = data.carteData;
    console.log("Deck.");
    console.log(cartePossedute);
    $(".CartePossedute").html("");
    for (var i = 0; i < data.carteData.length; i++) {
      $(".CartePossedute").append("<img class='carta' src='/img/Carte/" + data.carteData[i].id + ".png'></img>")
    }
  });

  socket.on('carteDeck', function(data) {
    if (data.ordine !== 0) return;
    $(".DeckPrimario").html("");
    for (var i = 0; i < data.carteData.length; i++) {
      var carta = data.carteData[i];
      $(".DeckPrimario").append(
        "<div><b>" + carta.nome + "</b>: Livello " + carta.livello + ", Vita " + carta.vita
        + ", Attacco " + carta.attacco + ", Velocità " + carta.velocita + "</div>"
      );
    }
  });
  $("#btnBattaglia").click(function() {
    $userHomePage.hide();
    $Battaglia.fadeIn();
    socket.emit('stanzaAttesa');
  });


  socket.on('Partita', function(data) {
    console.log(data.partita);
    $Battaglia.hide();
    $risultati.fadeIn();
    $(".nomeVincitore").text(data.partita.usernameVincitore);
    $(".nomeSconfitto").text(data.partita.usernameSconfitto);
    $(".trofeiVincitore").text("+ "+data.partita.trofei);
    $(".trofeiSconfitto").text("- "+data.partita.trofei);
    $(".trofeiTotaliVincitore").text(data.partita.trofeiVincitore);
    $(".trofeiTotaliSconfitto").text(data.partita.trofeiSconfitto);
    if(data.partita.vincitore == id) userData.trofei = data.partita.trofeiVincitore
    if(data.partita.sconfitto == id) userData.trofei = data.partita.trofeiSconfitto

  });

  socket.on('PartitaAvversario', function(data) {
    console.log(id)
    console.log(data.partita.sconfitto)
    if( (id == data.partita.sconfitto) || (id == data.partita.vincitore))
    {
    $Battaglia.hide();
    $risultati.fadeIn();
    $(".nomeVincitore").text(data.partita.usernameVincitore);
    $(".nomeSconfitto").text(data.partita.usernameSconfitto);
    $(".trofeiVincitore").text("+ "+data.partita.trofei);
    $(".trofeiSconfitto").text("- "+data.partita.trofei);
    $(".trofeiTotaliVincitore").text(data.partita.trofeiVincitore);
    $(".trofeiTotaliSconfitto").text(data.partita.trofeiSconfitto);
    if(data.partita.vincitore == id) userData.trofei = data.partita.trofeiVincitore
    if(data.partita.sconfitto == id) userData.trofei = data.partita.trofeiSconfitto
    }
  });

  $("#btnAnnulla").click(function() {
    $userHomePage.fadeIn();
    $Battaglia.hide();
    socket.emit('EsciStanzaAttesa');
  //  socket.emit('carteDeckPrimario');
  });

  $("#btnok").click(function() {
    $risultati.hide();
    $userHomePage.fadeIn();
    //Stampa le cose sulla home page
    console.log("ciao")
    console.log(userData)
    $(".trofei").text(userData.trofei);
    //socket.emit('EsciStanzaAttesa');
  //  socket.emit('carteDeckPrimario');
  });

});
//
