#!/bin/bash
echo "installing server configuration..."
#install systemd service
cp linux-configs/server.conf /lib/systemd/system/canbusprotector.service
systemctl enable /lib/systemd/system/canbusprotector.service

#set up iptables
cp ./linux-configs/server.iptables.rules /etc/iptables.rules
cp ./linux-configs/server.network.interfaces /etc/network/interfaces
iptables-restore < /etc/iptables.rules
#restore iptables on interface up
cp ./linux-configs/iptablesrestore.sh /etc/network/if-pre-up.d/iptables
chmod +x /etc/network/if-pre-up.d/iptables

#start service
systemctl start canbusprotector.service