var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(server);
var Twit = require('twit');
var searches = {};

var T = new Twit({
  consumer_key: 'OBDvvKF9jRuE7XTheA1VyL4ve',
    consumer_secret: '9wtySBuNt2G1HfHNqaGE1OldvzC4KKI7J7osYYDnbO7POyti7E',
    access_token: '814045362-HE0gr0WOaZXZwSaR8GJazngWuKcsizORC7i5GzR2',
    access_token_secret: 'ZUghTXuM8crLD45KwWMLjkh2w6lIeOuOEv2GAaB8MdQAe'
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Sockets
io.on('connection', function(socket) {
  searches[socket.id] = {};
  socket.on('q', function(q) {

    if (!searches[socket.id][q]) {
      console.log('New Search >>', q);

      //stream object to monitor twitter in real time for query
      var stream = T.stream('statuses/filter', {
        track: q
      });

      //get past tweets containing query, limit to the last 10 
      T.get('search/tweets', { q: q + ' since:2012-11-11', count: 10 }, function(err, tweet, response) {
        console.log(tweet)
        //emit event that informs us of older tweets
        socket.emit('past' + q, tweet);
      });

      //when there's a new tweet, emit the tweet event
      stream.on('tweet', function(tweet) {
        //console.log(q, tweet.id);
        socket.emit('tweet_' + q, tweet);
      });

      stream.on('limit', function(limitMessage) {
        console.log('Limit for User : ' + socket.id + ' on query ' + q + ' has reached!');
      });

      stream.on('warning', function(warning) {
        console.log('warning', warning);
      });

      // Reconnect if a disconnect occurs
      stream.on('reconnect', function(request, response, connectInterval) {
        console.log('reconnect :: connectInterval', connectInterval)
      });

      stream.on('disconnect', function(disconnectMessage) {
        console.log('disconnect', disconnectMessage);
      });

      searches[socket.id][q] = stream;
    }
  });

  socket.on('remove', function(q) {
    searches[socket.id][q].stop();
    delete searches[socket.id][q];
    console.log('Removed Search >>', q);
  });

  socket.on('disconnect', function() {
    for (var k in searches[socket.id]) {
      searches[socket.id][k].stop();
      delete searches[socket.id][k];
    }
    delete searches[socket.id];
    console.log('Removed All Search from user >>', socket.id);
  });

});

server.listen(3000);
console.log('Server listening on port 3000');
