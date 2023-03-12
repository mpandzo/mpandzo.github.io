---
title: Deploying PocketBase to a Digital Ocean droplet
description: The steps to follow to deploy PocketBase to a Digital Ocean droplet
pubDate: 2022-08-11
tags:
  - PocketBase
  - Digital Ocean
---

PocketBase is a beautiful single-file backend featuring a realtime database (SQLite), built-in user management, nice dashboard UI, configurable S3 storage and a simple REST API.

To deploy PocketBase to Digital Ocean you have to create a new droplet first <a href="https://docs.digitalocean.com/products/droplets/how-to/create/">[1]</a>. When you fill in the form to create your server use the Ubuntu distribution and make sure you specify your SSH keys for ssh access <a href="https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/">[2]</a>. When the create process completes, note down the droplet's assigned IP address as you will use it later.

Once the droplet is created, create an A record mapping the aforementioned assigned IP address to your domain name. You can do this at your domain name registrar if your DNS is managed there. Alternatively, you can point your domain name's nameservers to Digital Ocean and manage your DNS - and create your A record - there <a href="https://docs.digitalocean.com/products/networking/dns/quickstart/">[3]</a>.

Once your droplet is ready to go, ssh to it as the root user `ssh root@youripaddress`. Replace youripaddress with the IP address assigned to your droplet.

Once connected, run apt update and apt upgrade to make sure your server is up to date.

```shell
apt update
apt upgrade
```

While at it, install unzip as you'll need it to unzip the PocketBase archive.

```shell
apt install unzip
```

Configure the firewall to allow connections to ports 80 & 443. Don't forget port 22 tcp access as you'll no longer be able to ssh to your droplet otherwise.

```shell
sudo ufw allow 22/tcp
sudo ufw allow 80
sudo ufw allow 443
```

Enable the ufw firewall.

```shell
sudo ufw enable
```

You should see the following prompt and message:

```shell
Command may disrupt existing ssh connections. Proceed with operation (y|n)? y
Firewall is active and enabled on system startup
```

Now check that firewall is enabled and that the aforementioned ports are open:

```shell
ufw status
```

You should see the following:

```shell
Status: active

To                         Action      From
--                         ------      ----
80                         ALLOW       Anywhere
443                        ALLOW       Anywhere
22/tcp                     ALLOW       Anywhere
80 (v6)                    ALLOW       Anywhere (v6)
443 (v6)                   ALLOW       Anywhere (v6)
22/tcp (v6)                ALLOW       Anywhere (v6)
```

Now that the basics are configured, you can cd into the /opt folder and install PocketBase <a href="https://pocketbase.io/">[4]</a>. Please note the latest version of PocketBase is 0.7.10 at the time of writing. The example below targets the Linux amd64 OS and architecture.

```shell
cd /opt
wget https://github.com/pocketbase/pocketbase/releases/download/v0.7.10/pocketbase_0.7.10_linux_amd64.zip
mkdir pocketbase_0.7.10_linux_amd64
mv pocketbase_0.7.10_linux_amd64.zip pocketbase_0.7.10_linux_amd64
cd pocketbase_0.7.10_linux_amd64
unzip pocketbase_0.7.10_linux_amd64.zip
chmod +x pocketbase
```

You will note that I made a pocketbase_0.7.10_linux_amd64 directory where I stored all related files. This is done so that once an upgrade of PocketBase is released, I can unzip it in a different folder in /opt and run PocketBase from there instead.

You can now run your server with the following command:

```shell
./pocketbase serve --http="yourdomain.com:80" --https="yourdomain.com:443"
```

However, you may wish to allow your application to start on its own or restart in case the process get killed. To do this, create a Systemd service.

The following lines will create an empty pocketbase.service file in /lib/systemd/system and then open it in Nano.

```shell
touch /lib/systemd/system/pocketbase.service
nano /lib/systemd/system/pocketbase.service
```

Now, paste the following code and exit and save. Make sure to change relevant information like yourdomain.com and the installation directory if different.

```shell
[Unit]
Description = pocketbase

[Service]
Type           = simple
User           = root
Group          = root
LimitNOFILE    = 4096
Restart        = always
RestartSec     = 5s
StandardOutput = append:/opt/pocketbase_0.7.10_linux_amd64/logs/access.log
StandardError  = append:/opt/pocketbase_0.7.10_linux_amd64/logs/errors.log
ExecStart      = /opt/pocketbase_0.7.10_linux_amd64/pocketbase serve --http="yourdomain.com:80" --https="yourdomain.com:443"
```

You should now be able to enable and start the pocketbase service by running the following commands:

```shell
systemctl enable pocketbase.service
systemctl start pocketbase
systemctl status pocketbase
```

This should result in the following:

```shell
root@my-ubuntu:/opt/pocketbase_0.7.10_linux_amd64/logs# service pocketbase status
● pocketbase.service - pocketbase
     Loaded: loaded (/lib/systemd/system/pocketbase.service; disabled; preset: enabled)
     Active: active (running) since Tue 2022-11-08 04:40:57 UTC; 2s ago
   Main PID: 1942 (pocketbase)
      Tasks: 6 (limit: 511)
     Memory: 8.0M
        CPU: 31ms
     CGroup: /system.slice/pocketbase.service
             └─1942 /opt/pocketbase_0.7.10_linux_amd64/pocketbase serve --http=yourdomain.com:80 --https=yourdomain.com:443
```

If you have done the above, you should be able to to access your PocketBase instance via the following urls:

```shell
https://yourdomain.com/_/ - Admin dashboard UI
https://yourdomain.com/api - REST API
```

Note: if both the --http and --https flags are specified in the serve command defined above, PocketBase will provision an SSL certificate for your website using letsencrypt thus the website will be served from an https address.

Links:

- [1] <a id="link-1" href="https://docs.digitalocean.com/products/droplets/how-to/create/">How to Create a Droplet from the DigitalOcean Control Panel</a>
- [2] <a id="link-2" href="https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/">How-to Add SSH Keys to New or Existing Droplets</a>
- [3] <a id="link-3" href="https://docs.digitalocean.com/products/networking/dns/quickstart/">Dns Quickstart</a>
- [4] <a id="link-4" href="https://pocketbase.io/">PocketBase</a>
