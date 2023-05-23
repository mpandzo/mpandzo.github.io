---
title: Vercel functions timing out after 10 seconds on a pro account
description: Vercel functions still timing out after 10 seconds after upgrading to pro account
pubDate: 2023-05-23
tags:
  - Vercel
  - Serverless
  - Functions
---

Vercel Serverless Functions let you run code on-demand seamlessly. Serverless functions scale up and scale down relative to requests, so if the functions are not being called, no compute resources are being used.

Vercel enforces an execution timeout on all serverless function calls. The execution timeouts are set as follows at the time of writing this post:
- Hobby: 10 seconds
- Pro: 60 seconds
- Enterprise: 900

If you are running a project in a Hobby account, and you require a serverless function to execute for longer than 10 seconds, you will have to upgrade to a Pro account. You'll usually see 504 errors in your Vercel logs if this is the case.

When you upgrade your account to Pro, you may find that you are still experiencing 10 second execution timeouts! I certainly did. This is because upgrading your account to Pro is an administrative upgrade. In order for your application to "consume" resources and settings available in Pro you have to redeploy it.

So, to experience 60 second execution timeouts <strong>once you've upgraded from Hobby to Pro make sure you redeploy your application</strong>!
