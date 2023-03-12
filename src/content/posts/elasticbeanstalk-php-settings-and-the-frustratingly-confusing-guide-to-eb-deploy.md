---
title: ElasticBeanstalk, PHP settings and the frustratingly confusing guide to eb deploy
description: The random missing features of the eb deploy command
pubDate: 2022-11-01
tags:
  - WordPress
  - Amazon Linux 2
  - PHP
---

I'll be honest. I love using AWS. `eb deploy` is my go to command. The ElasticBeanstalk cloud ecosystem is amazing and I would find it hard to do my day job without it.

There is something to be said about the merry-go-round you are sent on when you need to change, upgrade, migrate (insert operative word here) a service your application relies on.

I recently <a href="/posts/amazon-linux-2-elasticbeanstalk-and-apache-httpd">moved a website from an Amazon Linux AMI to an Amazon Linux 2 platform</a>. Along the way, I found out that Apache HTTPD was no longer the default proxy server [<a href="https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.html">1</a>] used on ElasticBeanstalk instances.

Additionally, and randomly, the following php.ini settings can be configured via the `aws:elasticbeanstalk:container:php:phpini` option settings config namespace [<a href="https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_PHP.container.html">2</a>]:

- Proxy server – The proxy server to use on your environment instances. By default, nginx is used.
- Document root – The folder that contains your site's default page. If your welcome page is not at the root of your source bundle, specify the folder that contains it relative to the root path. For example, /public if the welcome page is in a folder named public.
- Memory limit – The maximum amount of memory that a script is allowed to allocate. For example, 512M.
- Zlib output compression – Set to On to compress responses.
- Allow URL fopen – Set to Off to prevent scripts from downloading files from remote locations.
- Display errors – Set to On to show internal error messages for debugging.
- Max execution time – The maximum time in seconds that a script is allowed to run before the environment terminates it.

E.g. you would set max_execution_time to 1000 by adding the following to your env.config file inside your .ebextensions folder:

```yml
option_settings:
  aws:elasticbeanstalk:container:php:phpini:
    max_execution_time: 1000
```

However, if you mistakenly assume you can also override `post_max_size`, you will be presented with a deploy error during `eb deploy`:

```
2022-11-01 01:05:31    ERROR   Invalid option specification (Namespace: 'aws:elasticbeanstalk:container:php:phpini', OptionName: 'post_max_size'): Unknown configuration setting.
```

Instead, to override other php.ini settings not included in the aforementioned list, you have to use the files block of a configuration file (e.g. .ebextensions/php-ini.config) to add a .ini file to /etc/php.d/:

```yml
files:
  "/etc/php.d/project.ini" :
    mode: "000644"
    owner: root
    group: root
    content: |
      upload_max_filesize = 64M
      post_max_size = 64M
      max_input_time = 1000
      html_errors = "On"
      display_startup_errors = "On"
```

Similarly, you would use the same approach to enable a PHP extension like Mongo [<a href="https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/php-configuration-phpini.html">3</a>]:

```yml
files:
  "/etc/php.d/99mongo.ini":
    mode: "000644"
    owner: root
    group: root
    content: |
      extension=mongo.so
```

Am I the only one frustrated with having to bore through multiple AWS docs articles to get to the bottom of the above while articles like <a href="https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/php-hawordpress-tutorial.html">Deploying a high-availability WordPress website with an external Amazon RDS database to Elastic Beanstalk</a> don't touch on the `eb deploy` aspect at all?

