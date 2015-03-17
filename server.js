var dgram = require("dgram");
var config = require("./config.json").server;
var clientaddr = require("./config.json").client.host;
var obdiiPIDs = require('./obdii-pids.json');
var socketcan = require('socketcan');
var server = dgram.createSocket("udp4");

var can = socketcan.createRawChannel(config.caninterface, true);

function lookupObdiiDesc(mode, PID) {
	var desc = "Unkown/Other";
	if (mode > 0 && obdiiPIDs[mode]) {
		if (obdiiPIDs[mode][PID]) {
			desc = obdiiPIDs[mode][PID].Desc;
		}
	}
	return desc;
}

//example message sending
//req: cansend vcan0 7df#03010c0000000000
//rep: cansend vcan0 7e0#03410c0001000000

can.addListener("onMessage", function(msg) {
	var buf = msg.data;
	if (msg.id >= 0x7E0 && msg.id <= 0x7E8) {
		var len = buf.readUInt8(0);
		var mode = buf.readUInt8(1);
		var PID = buf.readUInt8(2);
		var data = buf.slice(3);
		var desc = "Unkown/Other";
		//0x40 is added to reply mode
		var repmode = mode - 0x40;
		desc = lookupObdiiDesc(repmode, PID);
		var packet = {
			len: len,
			PID: PID,
			data: data,
			mode: mode,
			id: msg.id,
			desc: desc
		};
		sendmsg(packet);
		// console.log("   Rep," + mode + "," + PID + "," + data.toString('hex') + "," + desc);
	}
});

can.start();

function reqPID(req) {
	if (typeof req.PID === "string") {
		req.PID = parseInt(req.PID, 16);
	}
	req.interval = req.interval || 1000;
	var buf = new Buffer(8);
	buf.fill(0);
	buf.writeUInt8(2, 0);
	buf.writeUInt8(req.mode, 1);
	buf.writeUInt8(req.PID, 2);

	function doreq() {
		// console.log("Req," + req.mode + ',' + req.PID + ',' + lookupObdiiDesc(req.mode, req.PID));
		can.send({
			id: 0x7DF,
			data: buf
		});
	}
	if (req.interval === 0) {
		doreq();
	} else {
		setInterval(doreq, req.interval);
	}
}

config.monitor.forEach(reqPID);


function sendmsg(packet) {
	var buf = new Buffer(JSON.stringify(packet));
	//socket.send(buf, offset, length, port, address[, callback])#
	server.send(buf, 0, buf.length, 41234, clientaddr, function(err) {
		if (err) {
			console.error(err);
			server.close();
			process.exit();
		}
	});
}