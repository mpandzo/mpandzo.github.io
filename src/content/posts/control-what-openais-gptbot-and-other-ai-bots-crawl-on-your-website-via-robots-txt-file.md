---
title: Control what OpenAI's GPTBot and other AI bots crawl on your website via robots.txt file
description: You can control what OpenAI's GPTBot and other AI bots crawls on your website via the site's robots.txt file
pubDate: 2023-08-09
tags:
  - chatgpt
  - openai
  - robots.txt
  - gptbot
---

OpenAI recently (publicly) launched a website crawler called GPTBot that "may potentially be used to improve future models" and will "help AI models become more accurate and improve their general capabilities and safety". There is now also a <a title="OpenAI GPTBot documentation" target="_blank" rel="nofollow" href="https://platform.openai.com/docs/gptbot">documentation page</a> with more details.

The following user agent and string identifies the GPTBot crawler:

```yml
User agent token: GPTBot
Full user-agent string: Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)
```

The IP address block range used by the OpenAI crawler is documented on the following OpenAI link: <a href="https://openai.com/gptbot-ranges.txt">https://openai.com/gptbot-ranges.txt</a>.

You can prevent the GPTBot bot crawling your website via a standard Disallow entry in the robots.txt file:

```yml
User-agent: GPTBot
Disallow: /
```

The other known OpenAI bot is the <a title="ChatGPT-user bot" rel="nofollow" target="_blank" href="https://platform.openai.com/docs/plugins/bot">ChatGPT-User bot</a> used by plugins in ChatGPT. It is identified by the following user agent and string:

```yml
User agent token: ChatGPT-User
Full user-agent string: Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot
```

You can prevent the ChatGPT-User bot crawling your website via a standard Disallow entry in the robots.txt file:

```yml
User-agent: ChatGPT-User
Disallow: /
```

If you are concerned about other research bots crawling your website content, you can also disallow access for <a title="Common Crawler bot" rel="nofollow" target="_blank" href="https://commoncrawl.org/big-picture/frequently-asked-questions/">CCBot<a/>, the Common Crawler bot that "provides a copy of the internet to internet researchers, companies and individuals at no cost for the purpose of research and analysis". It is identified by the following user agent and string:

```yml
User agent token: CCBot
Full user-agent string: CCBot/2.0 (http://commoncrawl.org/faq/)
```

You can prevent the CCBot bot crawling your website via a standard Disallow entry in the robots.txt file:

```yml
User-agent: CCBot
Disallow: /
```

Of course, you also have more granular control over what you disallow for each of the bots mentioned above. You can do a partial Allow or Disallow with something like this:

```yml
User-agent: GPTBot
Allow: /directory-1/
Disallow: /directory-2/
```
