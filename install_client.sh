#!/bin/bash
echo "installing client configuration..."
cp ./linux-configs/client.conf /etc/init/canbusprotector.conf
cp ./linux-configs/client.iptables.rules /etc/iptables.rules
cp ./linux-configs/client.network.interfaces /etc/network/interfaces

cp ./linux-configs/iptablesrestore.sh /etc/network/if-pre-up/d/iptables
chmod +x /etc/network/if-pre-up.d/iptables