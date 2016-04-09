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

  var loginForm = $('.login-form');
  var logoutForm = $('.logout-form');

  // Prompt for setting a username
  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();
  var id;

  var socket = io();

  // Sets the client's username
  $( "#btnLogin" ).click(function setUsername () {
    username = $usernameInput.val().trim();
    password = $passwordInput.val();
    // If the username is valid
    if (username && password) {
      // Tell the server your username
      socket.emit('add user', {username : username, email: username, password : password});
    }
  });

  $( "#btnLogout" ).click(function setUsername () {
    socket.emit('logout');
  });


  socket.on('login', function (data) {
    console.log(data.addedUser);
    console.log(data.userData);
    // Se il login è avvenuto con successo
    if(data.addedUser == true)
    {
      id =data.userData.id
      $loginPage.hide();
      $userHomePage.fadeIn();
    //  $loginPage.off('click');

      loginForm.hide();
      logoutForm.show();

      //Stampa le cose sulla home page
      $(".name").text(data.userData.username);
      $(".money").text(data.userData.monete);
      $(".esperienza").text(data.userData.esperienza);
      $(".level").text("Lv: "+data.userData.livello);
      $(".trofei").text(data.userData.trofei);
    //  $(".welcome-message").text("Bentornato, " + data.userData.username + "!");
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
    $loginPage.fadeIn();
  });

  $( "#btnCreaMazzo" ).click(function setUsername () {
    $userHomePage.hide();
    $creaMazzo.fadeIn();
    socket.emit('cartePossedute', id);
  });

  socket.on('stampaPossedute', function (data) {
    console.log(data)
      $(".CartePossedute").append("<img src='/img/Carte/"+data.CarteData.idCarta+".png'></img>")
      console.log(data.CarteData)


  });
});
