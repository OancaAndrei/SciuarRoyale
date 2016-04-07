$(function() {

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $userHomePage = $('.userhome.page'); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();

  var socket = io();


  // Sets the client's username
  $( "#btnLogin" ).click(function setUsername () {
    username = $usernameInput.val().trim();
    // If the username is valid
    if (username) {

      // Tell the server your username
      socket.emit('add user', username);
    }
  });

  socket.on('login', function (addedUser) {
    console.log(addedUser)
    if(addedUser == false)
    {
        console.log("ciao")
        $loginPage.fadeOut();
        $userHomePage.fadeIn();
        $loginPage.off('click');
    }

});

});
