var bitmessage = require('bitmessage-node')('localhost', 8442, 'user', 'password');

module.exports = function(io) {
	io.on('connection', function (socket) {
		bitmessage.addresses.list(function(value) {
			socket.emit('news', value);
		});
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});
};

