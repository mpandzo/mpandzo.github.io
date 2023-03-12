---
title: Amazon Linux 2 ElasticBeanstalk and Apache HTTPD
description: Setting Apache HTTPD proxy server as the default proxy server on EB instances
pubDate: 2022-10-31
tags:
  - WordPress
  - Amazon Linux 2
  - Apache HTTPD
---

I recently had to migrate a legacy website from Amazon Linux AMI to the Amazon Linux 2 platform as the former is deprecated and no longer supports managed updates on AWS.

There is no automated way to do the migration so I created a new environment and deployed the application there, then CNAMEd the domain name to the new load balancer address.

Things went along smoothly enough with pretty much all configuration settings being compatible and transferrable. However, once the new environment was created and once my deploy script was done, I got 404 errors everywhere.

Interestingly enough, I noticed the 404 errors were being thrown by Nginx:

```html
404 Not Found
nginx/1.20.0
```

A bit of digging led me to the revelation that Amazon Linux 2 uses nginx as it's default proxy server [<a href="https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.html">1</a>]:

```markup
Elastic Beanstalk uses nginx as the default reverse proxy to map your application to your Elastic Load Balancing load balancer.
```

That was no good for me as I wanted to use the existing site's .htaccess file for url rewrite overrides and I didn't want to try and translate each .htaccess rule to an equivalent nginx.conf rule.

Luckily, AWS allows you to let Apache's HTTPD proxy server do your proxying. To do this, you have to create a config file inside your .ebextensions folder (e.g. .ebextensions/httpd-proxy.config) with the following content:

```yml
option_settings:
  aws:elasticbeanstalk:environment:proxy:
    ProxyServer: apache
```

Links:

- [1] <a id="link-1" href="https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.html">Extending Elastic Beanstalk Linux platforms</a>


