---
title: The tailwind dilemma - utility first vs semantic CSS
description: The dillemma of whether to use tailwind CSS or not
pubDate: 2022-10-23
tags:
  - TailwindCSS
  - CSS Frameworks
---

TailwindCSS is an interesting piece of software. It seems to mainly elicit two types of reaction. People either love it and use it every day or they really hate it. There is no sitting on the fence.

## Why is that?

If you Google "I hate TailwindCSS" or "I love TailwindCSS" you'll find a myraid of lists of cons and pros, rants and eulogies - you'll read for hours. I won't bother trying to summarise the results, and even if I tried, I wouldn't do them justice.

I will say this however, I believe the answer to the question above is in the framework's description found on the landing page above the fold:

```
A utility-first CSS framework packed with classes like flex, pt-4, text-center sand rotate-90 that can be composed to build any design, directly in your markup.
```

"Utility-first... in your markup".

TailwindCSS provides an idea of abstraction over CSS that some people love passionately and others really hate.

But hang on a second, you'll say, that's what CSS classes do - abstract CSS rules - TailwindCSS did not invent CSS classes!

And you would be right. TailwindCSS didn't invent CSS classes. What it does is champion the idea of abstracting away CSS rules without enforcing opinionated design decisions the way other "real" CSS frameworks do. It also does not enforce compartmentalisation the way <a href="https://maintainablecss.com/chapters/semantics/">semantic CSS</a> does.

Think about it, it's quite revolutionary!

With the above in mind, I'd still like to touch on a few points.

## When to use it?

Prototypes are a given.

You can 'npm install', set some rules in tailwind config and start working (on something meaningful) or you can use the CDN version:

```html
<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            clifford: '#da373d',
          }
        }
      }
    }
  </script>
</head>
<body>
  <h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
</body>
</html>
```

Either approach gets you there so quickly it's simply not up for debate. Tailwind beats everything hands down!

It is in complex projects however where TailwindCSS really shines.

### Skip the boring stuff

With TailwindCSS there is no need to ever write custom CSS to convert the most complex designs into HTML. Being able to skip writing raw CSS speeds up the development process tremendously! Think about it. The CSS part of your stack is 90% taken care of.

In addition, there is something to say about not having to constantly weigh up the best or most in fashion naming convention (BEM, ABEM, SMACSS etc) - this is a God-send in itself.

### But what about maintenance?

Any developer worth their salt writing code in 2022 will use some form of component design (atomic, modular, whatever) to compose their application. As such, changing an element's CSS rules sitewide requires changing the CSS classes of only that one element.

Now, think about a large application with hundreds of components written over a long period of time. The code will most likely have been written by different developers of different skill level each administering their own flavour of BEM or SMACSS. With TailwindCSS there is no such problem.

### There is code bloat

```html
<a class="inline-block px-4 py-3
    text-sm font-semibold text-center
    text-white uppercase transition
    duration-200 ease-in-out bg-indigo-600
    rounded-md cursor-pointer
    hover:bg-indigo-700">Button</a>
```

vs

```html
<a class="btn btn-primary">Button</a>
```

Yes, the latter is easier on the eyes than the former.

However, firstly, when abstracted in a component, the code bloat does not make much difference to every day development.

And secondly, if you really, really want to, you can use Tailwind's <a href="https://tailwindcss.com/docs/reusing-styles#extracting-classes-with-apply">@apply</a> feature to group sets of classes together to achieve the latter - though it's philosophically discouraged.

Thirdly, with the former approach you can immediately see what the component display intent is, without having to look in the CSS file.

And lastly, with the advent of http2 and faster, broadly adopted web speeds, inlining a bunch of CSS classes will not affect website performance. Tailwind's performance-focused setup leads to notoriously small CSS files, even for <a href="https://tailwindcss.com/docs/optimizing-for-production">large websites</a> (>10kb).

## Competion does it better?

I disagree strongly. Bootstrap, Foundation and Bulma (to name a few) are not TailwindCSS's competition. They are opinionated CSS frameworks on par with <a href="https://daisyui.com/">daisyUI</a> (an opinionated CSS framework built on top of TailwindCSS).

I was unable to find anything equivalent in Bulma. Foundation <a href="https://get.foundation/sites/docs-v5/utility-classes.html">lacks</a> a complete set of utility classes. Bootstrap provides <a href="https://getbootstrap.com/docs/4.0/utilities/borders/">utility classes</a> which you could probably use on their own for a utility-first development experience, however, their classes are more bloated than Tailwind's (.d-flex vs Tailwind's .flex etc) and as a result do not have the 'native' feel that Tailwind does. It almost feels like Bootstrap's utility classes are an afterthought to Tailwind's success.

You will simply not find a better utility-first CSS framework than TailwindCSS.

## Wrapping things up

In his review of <a href="https://mitjafelicijan.com/state-of-web-technologies-and-web-development-in-year-2022.html">mach and jam stacks</a>, Mitja Felicijan writes

```
Tailwind is good for two types of developers. Tailwind is good for a complete noob or a senior developer. A complete noob doesn’t really care about inner workings of CSS, and a senior developer also doesn’t care about CSS.
```

I interpret his "doesn't care" as "wants to not expend effort on" - TailwindCSS takes away your need to expend effort on the inner workings of CSS without reducing your power to use it to full capacity.

I strongly encourage you to try using TailwindCSS on one of your projects. I understand you may be reluctant. Coming from a semantic CSS development background myself it was very hard to make a conscious decision to switch to utility-first instead. Having done development with TailwindCSS for the past 2 years I can say I cannot imagine doing CSS any other way.
