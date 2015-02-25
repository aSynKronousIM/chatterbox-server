$(document).on('ready', function () {
  var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
  console.log(process.env.port);
  var tagOrComment = new RegExp(
    '<(?:'
      // Comment body.
    + '!--(?:(?:-*[^->])*--+|-?)'
      // Special "raw text" elements whose content should be elided.
    + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
    + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
      // Regular name
    + '|/?[a-z]'
    + tagBody
    + ')>',
    'gi');

  function removeTags(html) {
    var oldHtml;
    do {
      oldHtml = html;
      html = html.replace(tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
  }


  var friends = {};

  var newUpdate = function() {
    var currentRoom = $('#currentRoom').text();
    var roomName = $('#currentRoom').text();
    $.ajax('http://127.0.0.1:80/classes/messages', {
      type: 'GET',
      data: {where: roomName, order: '-createdAt', limit: "10"},
      dataType: 'json',
      success: function(response) {
        var div = $('<div></div>');
        for (var i = 0, count = response.length; i < count; i++) {
          var text;
          if (response[i].text !== undefined && response[i].text !== null) {
          }
          else {
            text = ""
          }
          var createdAt = removeTags(response[i].createdAt);
          var roomName;
          if (response[i].roomname !== undefined && response[i].roomname !== null) {
          }
          else {
            roomName = "unknown";
          }
          var userName;
          if (response[i].username !== undefined && response[i].username !== null) {
          }
          else {
            userName = undefined;
          }

          var content = $('<p></p>');
          if (friends[userName] === undefined) {
            content.append('Username: ' + '<div class="clickMe">' + response[i].username + '</div>' + '<br>');
          }
          else {
            content.append('Username: ' + '<strong>' + response[i].username + '</strong>' + '<br>');
          }
          content.append('Text: ' + text + '<br>');
          content.append('Create At: ' + createdAt + '<br>');
          content.append('Room Name: ' + roomName + '<br>');
          div.append(content);
        }
        $('.content').html(div);
      },
      contentType: 'application/json',
      error: function(errorMessage, errorType, error) {
      }
    });
  };
  var updateFriends = function(){
    $.ajax('http://127.0.0.1:80/classes/friends', {
      type: 'GET',
      data: {username: $('#currentUserName').text()},
      dataType: 'json',
      contentType: 'application/json',
      success: function(response) {

        var content = $('<ul></ul>');
        for (var i = 0, count = response.length; i < count; i++) {
          if(friends[response[i].friend] === undefined) {
            friends[response[i].friend] = true;
            content.append("<li>"+response[i].friend+"</li>");
          }
        }
        $('#friends').html(content);
      },
      error: function(errorMessage, errorType, error) {
      }
    });
  };


  $('body').on('click', '.clickMe', function(event) {
    event.preventDefault();
    var friend = $(this).text();
    if(friends[friend] === undefined) {
      friends[friend] = true;
      var obj = {
        "username": $('#currentUserName').text(),
        "friend": friend
      };

      var JSONobj = JSON.stringify(obj);

      $.ajax('http://127.0.0.1:80/classes/friends', {
        type: 'POST',
        data: JSONobj,
        dataType: 'json',
        contentType: 'application/json',
        success: function() {
          friends = {};
          updateFriends();
        },
        error: function() {
          console.log('data was not submitted');
        }
      });
    }
  });

  $('body').on('submit', '.name', function(event) {
    event.preventDefault();
    friends = {};
    $('#currentUserName').text($('#username').val());
    updateFriends();
    $('#username').val("");
  });

  $('body').on('submit', '.room', function(event) {
    event.preventDefault();
    $('#currentRoom').text($('#roomname').val());
    newUpdate();
    $('#roomname').val("")
  });

  $('body').on('click', '.refresh', function() {
    newUpdate();
  });

  $('body').on('submit', '.message', function(event) {
    event.preventDefault();
    var obj = {
      "username": $('#currentUserName').text(),
      "text": $('#text').val(),
      "roomname": $('#currentRoom').text()
    };

    var JSONobj = JSON.stringify(obj);

    $.ajax('http://127.0.0.1:80/classes/messages', {
      type: 'POST',
      data: JSONobj,
      dataType: 'json',
      contentType: 'application/json',
      success: function() {
        newUpdate();
      },
      error: function() {
        console.log('data was not submitted');
      }
    });
    $('#text').val("");
  });
  newUpdate();
  updateFriends();
  setInterval(newUpdate, 10000);
});
































