---
title: Vercel Error - Static page generation is still timing out after 3 attempts
description: Large sitemap static page generation keeps timing out during Vercel build
pubDate: 2024-01-12
tags:
  - Vercel
  - Static page generation timeout
  - WordPress Rest API
  - Headless WordPress
---

I recently restructured a legacy WordPress website to use headless WordPress (via Rest API) with a Nextjs frontend. WordPress is an easy to use CMS but I find that I can tremendously improve security, performance, and scalability of applications by decoupling WordPress content from the presentation layer.

This particular WordPress website had 3000 posts that seldom change. This made them perfect candidates for static generation with cache invalidation on-demand. The cache invalidation is achieved via a simple call to Nextjs' `revalidatePath` triggered by a curl request from within a `save_post` <a href="https://developer.wordpress.org/reference/hooks/save_post/">WordPress action</a>. As a result, when a WordPress post is saved the particular path's cache in Nextjs is invalidated and rebuilt with up to date content.

To make sure Google, Bing and other search engines are kept informed about the pages and posts available on my website I also built a sitemap by adding a sitemap.ts file to the app folder per the <a href="https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap">Nextjs docs</a>. A function inside the sitemap.ts file recursively paginates through all my WordPress posts (50 at a time) and adds them to a `MetadataRoute.Sitemap` array that the sitemap page returns.

This all worked perfectly locally but when I deployed to Vercel my build kept failing. Looking at the build logs I found the following message `Static page generation for /sitemap.xml is still timing out after 3 attempts`.

Turns out my recursive fetches took too long to process during the build. They went on for 2.5 minutes while the default timeout for static page generation for Nextjs on Vercel is set to <a hrf="https://nextjs.org/docs/messages/static-page-generation-timeout">60 seconds</a>.

To solve the problem I added the following setting override to my next.config.js file:

```
staticPageGenerationTimeout: 600, // timeout after 10 minutes
```

<strong>Note</strong>: though I experienced this issue when generating a sitemap, you can also run into this issue with getStaticPaths. If you are using dynamic routes and you want to prebuild all the possible paths served by the dynamic routes you will want to define them via getStaticPaths, and if the static generation takes long enough it will trigger the timeout as well.
