---
title: Docker compose for WordPress - Permission denied and uid 1000
description: Unable to upgrade WordPress due to - \"failed to open stream - Permission denied error\"
pubDate: 2022-10-26
tags:
  - WordPress
  - Docker compose
---

I've got a simple docker-compose.yml file for working on WordPress projects locally.

```yml
version: "3.5"

services:

  mysql:
    container_name: wp-mysql
    privileged: true
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress

  wordpress:
    container_name: wp-wordpress
    privileged: true
    depends_on:
      - mysql
    image: wordpress:latest
    volumes:
      - ./:/var/www/html
    ports:
      - "8080:80"
    restart: always

  phpmyadmin:
    container_name: wp-phpmyadmin
    privileged: true
    image: phpmyadmin/phpmyadmin
    depends_on:
      - mysql
    ports:
      - 8181:80
    environment:
      MYSQL_USERNAME: root
      MYSQL_ROOT_PASSWORD: root
      MYSQL_PORT_3306_TCP_ADDR: mysql
      PMA_HOST: mysql
```

I've used this without any issues on my MacBook Air by running `docker-compose up`.

When I recently tried to do the same on a windows machine running WSL (Windows Subsystem for Linux) and I tried to upgrade to the latest version of WordPress, I faced the following error in WordPress dashboard:

```text
Update WordPress
Downloading update from https://downloads.wordpress.org/release/wordpress-6.0.3-new-bundled.zip…

The authenticity of wordpress-6.0.3-new-bundled.zip could not be verified as no signature was found.

Unpacking the update…

Warning: copy(/var/www/html/wp-admin/includes/update-core.php): failed to open stream: Permission denied in /var/www/html/wp-admin/includes/class-wp-filesystem-direct.php on line 309
The update cannot be installed because we will be unable to copy some files. This is usually due to inconsistent file permissions.: wp-admin/includes/update-core.php

Installation failed.
```

In order to see what permissions are set up inside the /var/www/html that may be causing this, I bashed into the container with the following command:

```shell
docker exec -ti wp-wordpress bash
```

The result and subsequent `ls -la` listing looks like this:

```shell
root@6eaac5e083f5:/var/www/html# ls -la
drwxr-xr-x  8 1000 1000   4096 Oct 26 01:39 .
drwxr-xr-x  1 root root   4096 Oct  5 07:09 ..
-rw-r--r--  1 1000 1000   1051 Aug 25  2021 .htaccess
-rw-r--r--  1 1000 1000   1812 Oct 26 01:39 docker-compose.yml
-rw-r--r--  1 1000 1000    405 Apr 30  2021 index.php
-rw-r--r--  1 1000 1000  19915 Aug 25  2021 license.txt
-rw-r--r--  1 1000 1000   7346 Oct 20  2021 readme.html
-rw-r--r--  1 1000 1000   5626 Apr 30  2021 readme.md
-rw-r--r--  1 1000 1000   7165 Apr 30  2021 wp-activate.php
drwxr-xr-x  9 1000 1000   4096 Aug 25  2021 wp-admin
-rw-r--r--  1 1000 1000    351 Apr 30  2021 wp-blog-header.php
-rw-r--r--  1 1000 1000   2328 Apr 30  2021 wp-comments-post.php
-rw-r--r--  1 1000 1000   3004 Aug 25  2021 wp-config-sample.php
-rw-r--r--  1 1000 1000   5907 Jun 30  2021 wp-config.php
drwxrwxrwx  6 1000 1000   4096 Jun 30  2021 wp-content
-rw-r--r--  1 1000 1000   3939 Apr 30  2021 wp-cron.php
drwxr-xr-x 25 1000 1000  12288 Aug 25  2021 wp-includes
-rw-r--r--  1 1000 1000   2496 Apr 30  2021 wp-links-opml.php
-rw-r--r--  1 1000 1000   3900 Aug 25  2021 wp-load.php
-rw-r--r--  1 1000 1000  45463 Aug 25  2021 wp-login.php
-rw-r--r--  1 1000 1000   8509 Apr 30  2021 wp-mail.php
-rw-r--r--  1 1000 1000  22297 Aug 25  2021 wp-settings.php
-rw-r--r--  1 1000 1000  31693 Aug 25  2021 wp-signup.php
-rw-r--r--  1 1000 1000   4747 Apr 30  2021 wp-trackback.php
-rw-r--r--  1 1000 1000   3236 Apr 30  2021 xmlrpc.php
root@6eaac5e083f5:/var/www/html#
```

From the above, I gathered that the files and folders were owned by user:group 1000:1000. Further reading lead to the finding that on most Linux systems UID:GUID of 1000:1000 is used for the first non-system account created. In addition, when volumes are mounted docker sets UID:GUID for volume mounted files and folders to the same. <a href="https://github.com/moby/moby/issues/22114">[1]</a>, <a href="https://github.com/davidalger/warden/issues/155">[2]</a>.

As a result, when the apache's www-data user tries to modify files or folders owned by 1000:1000 we face the issue described at the beginning of this post.

To get around this I switched to building my WordPress image with the help of a Dockerfile where I change ownership of the files and folders to www-data:www-data.

My modified docker-compose.yml file:

```yml
version: "3.5"

services:

  mysql:
    container_name: wp-mysql
    privileged: true
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress

  wordpress:
    container_name: wp-wordpress
    privileged: true
    depends_on:
      - mysql
    image: local-wordpress:latest
    build:
      context: .
      dockerfile: Dockerfile.WordPress
    volumes:
      - ./:/var/www/html
    ports:
      - "8080:80"
    restart: always

  phpmyadmin:
    container_name: wp-phpmyadmin
    privileged: true
    image: phpmyadmin/phpmyadmin
    depends_on:
      - mysql
    ports:
      - 8181:80
    environment:
      MYSQL_USERNAME: root
      MYSQL_ROOT_PASSWORD: root
      MYSQL_PORT_3306_TCP_ADDR: mysql
      PMA_HOST: mysql
```

Dockerfile (Dockerfile.WordPress) thanks to <a href="https://stackoverflow.com/questions/55620273/docker-php-fpm-running-as-www-data">[3]</a>:

```dockerfile
FROM wordpress:latest

ARG UNAME=www-data
ARG UGROUP=www-data
ARG UID=1000
ARG GID=1000
RUN usermod  --uid $UID $UNAME
RUN groupmod --gid $GID $UGROUP
```
