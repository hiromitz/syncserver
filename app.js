
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var devices = {}, i = 0;

// device view
app.get('/', function(req, res){
  res.render('index', { port: process.env.PORT });
});
// controller view
app.get('/controller', function(req, res){
  res.render('controller', { devices: devices });
});

// Express server
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Socket.io
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {

	socket.user = i;
	i++;

	var url = 'http://corabbit.com/home';

  socket.on('hello', function(data) {

  	devices[socket.user] = data.my;
  	io.sockets.emit('hello', {devices: devices});
  	io.sockets.emit('updated', {url: url});
  });

  socket.on('url changed', function(data) {
		url = data.url;
		io.sockets.emit('updated', {url: url});
  });

  socket.on('disconnect', function () {
    delete devices[socket.user];
    io.sockets.emit('hello', {devices: devices});
  });
});