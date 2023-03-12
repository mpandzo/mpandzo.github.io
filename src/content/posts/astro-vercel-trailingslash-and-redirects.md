---
title: Astro, Vercel, TrailingSlash and Redirects
description: I moved my personal website to Vercel using Astro
pubDate: 2023-03-12
tags:
  - Vercel
  - Astro
  - Redirects
---

I moved my personal website to Vercel recently. It was previously hosted on github pages. I also changed the static site generator I use from 11ty to Astro. Astro is taking the SSG world by storm because of how simple yet powerful it is.

Once I moved everything across I realised that trailing slashes were being added to my urls (canonical, sitemap etc). Digging into this led me to discover that Astro does this by default.

This is something I needed to change as my previous implementation was trailing slash free and I was not in the mood to Google to reindex my blog posts. To change the default behaviour <a rel="bookmark" href="https://docs.astro.build/en/reference/configuration-reference/#trailingslash">the Astro reference</a> recommends setting `trailingSlash: 'never'` in the Astro config file like so:

```js
export default defineConfig({
  trailingSlash: 'never',
});
```

This fixes the links inside sitemaps however I found that the default canonical url used in BaseHead.astro still had a trailing slash attached.

To fix this I modified the canonicalURL variable in BaseHead.astro as follows (thanks <a rel="bookmark" href="https://noahflk.com/blog/trailing-slashes-astro">noahflk</a>):

```js
function removeTrailingSlash(str: string) {
  return str.replace(/\/+$/, '');
}

const canonicalURL = removeTrailingSlash(new URL(Astro.url.pathname, Astro.site).toString());
```

Looks like Astro still serves both the trailing slash and trailing slash free requests however. On localhost this is fine however on production I'd like to avoid this (even though ideally Google and other crawlers will be fine considering we set the canonical url to point to the trailing slash free url) with the fix above.

This is easily solved via the vercel.json file however, by adding the following entry:

```json
{
  "trailingSlash": false
}
```

Once the above is set Vercel will redirect all requests to urls that contain trailing slashes on your website to their non-trailing slash url equivalents.

Finally, while we are on the topic of the vercel.json file, it's also handy when you need to deal with redirects. Astro does not have a way of handling redirects en-mass at the time of writing this post. There are <a rel="bookmark" href="https://github.com/withastro/roadmap/issues/466">discussions</a> on the topic but nothing has been decided as of yet.

To create redirects using vercel.json you simply add a redirects section like so:

```json
{
  "redirects": [{
      "source": "/posts/sst-cannot-use-graphqlscalartype-boolean-from-another-module-or-realm",
      "destination": "/sst-cannot-use-graphqlscalartype-boolean-from-another-module-or-realm",
      "permanent": true
    }
  ]
}
```

Vercel will redirect any requests to the source in the redirects section to the destination. The permanent property lets you toggle between permanent and temporary redirect. When true, the status code is 308. When false the status code is 307.
