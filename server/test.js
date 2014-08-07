//var Readable = require('stream').Readable;
//var rs = Readable();
//
//var c = 97 - 1;
//
//rs._read = function () {
//	if (c >= 'z'.charCodeAt(0)) return rs.push(null);
//
//	setTimeout(function () {
//		rs.push(String.fromCharCode(++c));
//	}, 100);
//};
//
//rs.pipe(process.stdout);
//
//process.on('exit', function () {
//	console.error('\n_read() called ' + (c - 97) + ' times');
//});
//process.stdout.on('error', process.exit);

//process.stdin.on('readable', function () {
//	var buf = process.stdin.read(3);
//	console.dir(buf);
//	process.stdin.read(0);
//});

var net = require('net'),
	Put = require('put'),
	crypto = require('crypto');

var client = net.connect(8444, function() {
	console.log('connected');

	var payload = Put()
		// version
		.word32be(2)
		// services
		.word64be(1)
		// timestamp
		.word64be(Math.round(new Date().getTime() / 1000))
		// addr_recv
		.word64be(1)
		.pad(10)
		.put(new Buffer('FFFF', 'hex'))
		.word32be(2130706433)
		.word16be(8444)
		// addr_from
		.word64be(1)
		.pad(10)
		.put(new Buffer('FFFF', 'hex'))
		.word32be(2130706433)
		.word16be(8444)
		// nonce
		.word64be(85)
		// user agent
		.pad(1)
		// Stream number list
		.word8be(1)
		.word8be(1)
		.buffer();

	console.dir(payload.toString('hex'))

	var cmd = createPacket('version', payload);
	client.write(cmd);
});

client.on('data', function(data) {
	console.log(data.toString('ascii'));
	client.end();
});

client.on('end', function() {
	console.log('client disconnected');
});

client.on('error', function(e) {
	console.log(e);
});

function randomInt (low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

function createPacket(command, payload) {
	var payload_length = payload.length;

	var buff = Put()
		.word32be(0xE9BEB4D9)
		.put(new Buffer(command))
		.pad(12 - command.length)
		.word32be(payload_length)
		.put(crypto.createHash('sha512').update(payload).digest().slice(0, 4))
		.put(payload)
		.buffer();

	console.log(payload_length);
	console.dir(crypto.createHash('sha512').update(payload).digest().toString('hex'))
	console.dir(crypto.createHash('sha512').update(payload).digest().slice(0, 4).toString('hex'))
	console.dir(buff.toString('hex'))

	return buff;
}