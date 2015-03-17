#!/bin/bash
echo "installing server configuration..."
cp ./linux-configs/server.conf /etc/init/canbusprotector.conf
cp ./linux-configs/server.iptables.rules /etc/iptables.rules
cp ./linux-configs/server.network.interfaces /etc/network/interfaces

cp ./linux-configs/iptablesrestore.sh /etc/network/if-pre-up.d/iptables
chmod +x /etc/network/if-pre-up.d/iptables