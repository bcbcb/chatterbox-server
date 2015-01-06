$(document).ready(function () {

  $('.submit').on('click', app.handleSubmit);

  $('.tabber a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  });

  $('body').on('click', '#roomMenu .roomName', function (e) {
    e.preventDefault();
    app.fetch($(this).text());
    app.room = $(this).text();
    $('h1').text(app.room);
  });

  $('h1').text(app.room);

  $('body').on('click', '.username', function (e) {
    e.preventDefault();
    if (app.friends.indexOf($(this).text()) === -1) {
      app.addFriend($(this).text());
      $('table').append("<tr><td>" + $(this).text() + "</td></tr>");
    }
  });

});
