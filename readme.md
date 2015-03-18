#CANBus Protector
CANBus protector is a (very simple) CANBus IPS system built on two separate pieces of hardware that use one-way communication to get information out of the "trusted" vehicle network. The only way I could see protecting the bus was to create a "server" which would sit on the actual CAN and perform the queries for vehicle information. This is done through standard set of OBDII queries made by the server (e.g. Vehicle Speed, RPM, VIN, etc). Future expansion of the project would include more queries and manufacturer specific information. The server then publishes that information via one-way communication to a "client". The client sets up an entirely separate CANBus where any third party systems would sit. These third party systems requiring vehicle information would not be aware they are not speaking to the actual vehicle network.

This limits the attack surface by removing the risk of third party dongles plugged into a vehicle OBDII port. This device does not attempt to address the vehicle manufacturer itself attaching a network-enabled system directly to the CAN (which is happening). That particular action cannot be protected against except by vehicle manufacturers. The best one could hope for out of a third party solution is alert the user if a certain type of message is seen on the bus. If that message is malicious, however, it may be too late. It could certainly work as a "black box" of sorts though.

#Setup
To use CANBus Protector you will need two beaglebones configured as outlined at https://github.com/digitalbond/canbus-beaglebone.

Connect the beaglebones to eachother via an ethernet cable. One of them will act as the "server" which plugs into your OBDII port. The other acts as the "client" to which you will connect any third party devices.

On each the server and the client, clone this repo or copy it onto the device and run the install script:
```sh
cd canbus-protector
./install_server.sh
```
or
```sh
cd canbus-protector
./install_client.sh
```

**NOTE**: once you have run the install scripts the network configurations will change on the next boot and you *will not* be able to ssh to the beaglebones via ethernet any longer. The USB connection should still work fine for debug purposes, however.

##Supported OBDII PIDs
You can edit the config.json file to add more supported OBDII PIDs, or edit the source directly to support non-standard OBDII information. A sample configuration is provided which will allow third party devices to read the Engine RPM, Vehicle Speed, Throttle Position, and Run time since engine start.

##Vehicle CAN Bitrate

By default this system assumes a CAN bitrate of 500000 (most common). Your vehicle may be different. To change this, edit the .conf files in the linux-configs directory and set the bitrate to the appropriate value.
