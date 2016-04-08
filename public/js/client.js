$(function() {

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $passwordInput = $('.passwordInput'); // Input for password
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $userHomePage = $('.userhome'); // The chatroom page

  var loginForm = $('.login-form');
  var logoutForm = $('.logout-form');

  // Prompt for setting a username
  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();

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
    // Se il login è avvenuto con successo
    if(data.addedUser == true)
    {
      $loginPage.fadeOut();
      $userHomePage.fadeIn();
      $loginPage.off('click');

      loginForm.hide();
      logoutForm.show();

      $(".welcome-message").text("Bentornato, " + data.userData.username + "!");
    }
    else {
      alert("Username o password errati");
    }

  });

  socket.on('logout', function() {
    logoutForm.hide();
    loginForm.show();

    $(".welcome-message").text("Benvenuto su Sciuar Royale!");
  });

});
