---
title: Vercel domain stuck on generating SSL certificate
description: Added a domain for my production deploy but the domain was stuck on "Generating SSL Certificate"
pubDate: 2024-01-11
tags:
  - Vercel
  - SSL Certificate
---

I am an avid user of Vercel's platform. It's easy to use and the UX is a joy. From time to time I do run into head-scratching issues that require doing a bit of reasearch to figure out.

I recently configured a Production Deployment domain name - usually a straight forward process - via Settings -> Domains. I added the domain name and waited for the A and CNAME (www) DNS record changes to propagate.

After a few hours I went to Vercel's Settings -> Domains dashboard to find that the domain name and www subdomain were both stuck on "Generating SSL Certificate".

This was something that I had not previously experienced with other domain names. What I have usually experienced is once Vercel is able to detect your DNS changes, the letsencrypt.org SSL generation takes a minute max.

From reading <a href="https://vercel.com/guides/domain-not-generating-ssl-certificate">Vercel's docs</a> I deduced that perhaps my domain name was associated with another certificate authority, though I did not see another CAA record in the DNS to verify this, and this is what caused the issue.

```Since we use Let's Encrypt for our automatic SSL certificates, you must add a CAA record with the value 0 issue "letsencrypt.org" if other CAA records already exist on your domain.```

So, I needed to set the right CAA (Certificate Authority Authorization) DNS record for my domain. I added a CAA record with the value `0 issue "letsencrypt.org"`. Note: Subdomains inherit the CAA record so there is no need to add a record for www if you have already added it for the root domain name.

Once I made this DNS change and the change propagated, I still had to remove the domain name and www subdomain from Vercel's Settings -> Domains dashboard then readd them in order to re-trigger the certificate generation.
