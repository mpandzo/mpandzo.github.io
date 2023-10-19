---
title: Next/Image "url" parameter is valid but upstream response is invalid
description: Getting "url" parameter is valid but upstream response is invalid error with Next/Image on WSL2
pubDate: 2023-10-19
tags:
  - NextJs
  - Next/Image
  - WSL2
---

The Windows Subsystem for Linux (WSL) is a convenient way to run Linux distros alongside your Windows 11 installation. In fact, I do most of my day-to-day development inside a WSL2 Ubuntu distro connected to Visual Studio Code.

I am in the process of developing a web application with Next.js 13 and Vercel and I am using the <a href="https://nextjs.org/docs/pages/api-reference/components/image">Image Component</a> to load images.

Yesterday, without doing anything out of the ordinary that may cause such an issue, I started seeing the following error in the console for images loaded from the `public` folder locally:

```
"url" parameter is valid but upstream response is invalid
```

Referenced images stopped loading on screen as a result.

I initially went down the rabbit hole of Googling the issue - with no success - before remembering that I am using WSL2.
WSL allows you to install and run a Linux distribution (e.g. Ubuntu) on your Windows machine without the overhead of a traditional virtual machine or dualboot setup. WSL as such, deals with file system operations and mapping etc from the Linux distro to the host Windows OS implicitly.

I suspected something got messed up with the WSL file system to cause the error I was seeing because simply removing the .next folder and letting next rebuild things did not help.

So, I restarted WSL with the following command (in Command Prompt (or PowerShell)) where I replaced DISTRO-NAME with the distribution name, in my case Ubuntu:

```
wsl -t DISTRO-NAME
```

You can list the distributions your are currently running with the following command:

```
wsl --list --verbose
```

Images are now back and the error is no more!
