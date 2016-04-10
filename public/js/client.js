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

  var loginForm = $('.login-form');
  var logoutForm = $('.logout-form');

  // Prompt for setting a username
  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();
  var id;

  var socket = io();

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
      socket.emit('carteDeckPrimario');
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
    $loginPage.fadeIn();
    $("#registerUser").fadeIn();
  });

  $("#btnCreaMazzo").click(function() {
    $userHomePage.hide();
    $creaMazzo.fadeIn();
    socket.emit('cartePossedute');
    socket.emit('carteDeckPrimario');
  });

  $("#btnMenu").click(function() {
    $creaMazzo.hide();
    $userHomePage.fadeIn();
  });

  socket.on('stampaPossedute', function(data) {
    $(".CartePossedute").html("");
    for (var i = 0; i < data.carteData.length; i++) {
      $(".CartePossedute").append("<img class='carta' src='/img/Carte/" + data.carteData[i].idCarta + ".png'></img>")
    }
  });

  socket.on('carteDeckPrimario', function(data) {
    console.log("Deck primario.");
    console.log(data);
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

/*
  socket.on('Partita', function(data) {
  });
*/
  $("#btnAnnulla").click(function() {
    $userHomePage.fadeIn();
    $Battaglia.hide();
    socket.emit('EsciStanzaAttesa');
  //  socket.emit('carteDeckPrimario');
  });

});
//
