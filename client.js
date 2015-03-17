var dgram = require('dgram');
var config = require('./config.json').client;
var obdiiPIDs = require('./obdii-pids.json');
var client = dgram.createSocket("udp4");
var socketcan = require('socketcan');
var can = socketcan.createRawChannel(config.caninterface, true);


var canstate = [];

function lookupObdiiDesc(mode, PID) {
	var desc = "Unkown/Other";
	if (mode > 0 && obdiiPIDs[mode]) {
		if (obdiiPIDs[mode][PID]) {
			desc = obdiiPIDs[mode][PID].Desc;
		}
	}
	return desc;
}

client.on("error", function(err) {
	console.log("client error:\n" + err.stack);
	console.error("client error:\n" + err.stack);
	client.close();
	process.exit();
});

client.on("message", function(msg, rinfo) {
	var packet = JSON.parse(msg);
	packet.data = new Buffer(packet.data, 'hex');
	// console.log("client got: ", packet);
	if (canstate[packet.mode] === undefined) {
		canstate[packet.mode] = [];
	}
	canstate[packet.mode][packet.PID] = packet;
});

client.on("listening", function() {
	var address = client.address();
	console.log("client listening " +
		address.address + ":" + address.port);
});

client.bind(config.port);
// client listening 0.0.0.0:41234

function sendReply(packet) {
	// console.log('sending reply', packet);
	var buf = new Buffer(3);
	buf.writeUInt8(packet.len, 0);
	buf.writeUInt8(packet.mode, 1);
	buf.writeUInt8(packet.PID, 2);
	buf = Buffer.concat([buf, packet.data]);
	can.send({
		id: 0x7E8,
		data: buf
	});
}


can.addListener("onMessage", function(msg) {
	var buf = msg.data;
	if (buf.length < 3) {
		return;
	}
	if (msg.id === 0x7DF) {
		var mode = buf.readUInt8(1);
		var PID = buf.readUInt8(2);
		// var data = buf.slice(3);
		var desc = lookupObdiiDesc(mode, PID);
		// console.log("Request for", desc);
		var repmode = mode + 0x40;
		if (canstate[repmode] !== undefined && canstate[repmode][PID] !== undefined) {
			// console.log("  Replying with:", canstate[repmode][PID].data.toString('hex'));
			sendReply(canstate[repmode][PID]);
		} else {
			// console.log("  Unable to reply. Unknown");
		}
	}
});

can.start();

process.on('SIGINT', function() {
	can.stop();
	canstate.forEach(function(mode, i) {
		mode.forEach(function(pid, ind) {
			if (pid !== undefined) {
				console.log("====", i, ind, pid);
			}
		});
	});
	process.exit();
});