---
title: The power of laziness - automating some text entry work
description: Laziness is what makes us software developers offload the grunt work to the computer
pubDate: 2022-07-26
tags:
  - Laziness
  - Automation
---

I hate repetitive work. Read, copy, paste, edit, repeat. It's horribly monotonous and I always make a mistake that I have to go back and fix.

As a friend of mine quipped once, perhaps humans invent stuff out of laziness? Some lazy bastard didn't want to walk so they invented the wheel. What's the remote control if not the quintessence of laziness - it's there because someone couldn't be bothered to get up and change the channel. The same goes for escalators, cars, telephones etc.

All jesting aside, laziness of this kind is not for a lack of energy or care, it's about wanting to find easier, more efficient ways to accomplish something. And the art of programming is all about this exact practice. Finding solutions that will make the computer do the grunt work for you.

I recently needed to convert an array of strings into an array of JSON objects. Along the way, I also needed to slugify the string and get rid of accents/diacritics - you know, convert letters like í,á,ü into i,a,u.

My original array looked like this:

```json
const teamsLaLiga = [
  "Almería",
  "Athletic Bilbao",
  "Atlético Madrid",
  "Barcelona",
  "Cádiz",
  "Celta Vigo",
  "Elche",
  "Espanyol",
  "Getafe",
  "Girona",
  "Mallorca",
  "Osasuna",
  "Rayo Vallecano",
  "Real Betis",
  "Real Madrid",
  "Real Sociedad",
  "Sevilla",
  "Valencia",
  "Valladolid",
  "Villarreal",
];
```

Notice the `á` and `é` in Cádiz and Atlético Madrid.

I wanted to achieve JSON in the form of:

```js
const jsonTeams = [
  ...
  {
    name: 'Atletico Madrid',
    displayName: 'Atlético Madrid',
    slug: 'atletico-madrid'
    league: 'la-liga',
  },
  ...
]
```

Now, sure, this was a fairly small array, and I could have done the work manually, however, I wanted to do the same with Turkish Süper Lig team names like "Fatih Karagümrük" and "İstanbul Başakşehir", and Portuguese Primeira liga team names like "Marítimo" and "Paços de Ferreira". There'd be a lot of manual work involved.

So, instead of manually copying, pasting and editing things for an hour, I quickly wrote a script to do the work for me. To get rid of accents/diacritics I used the lodash library's <a rel="bookmark nofollow" href="https://docs-lodash.com/v4/deburr/">deburr</a> method. To slugify titles I used the <a rel="bookmark nofollow" href="https://www.npmjs.com/package/slugify">slugify</a> library. Both were added to my simple script as script references via <a rel="bookmark nofollow" href="https://cdn.jsdelivr.net">cdn.jsdelivr.net</a>.

The html to achieve this looks like this:

```html
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/slugify@1.6.5/slugify.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/lodash.deburr@4.1.0/index.js"></script>
  <script>
  (() => {
    const teamsLaLiga = [
      "Almería",
      "Athletic Bilbao",
      "Atlético Madrid",
      "Barcelona",
      "Cádiz",
      "Celta Vigo",
      "Elche",
      "Espanyol",
      "Getafe",
      "Girona",
      "Mallorca",
      "Osasuna",
      "Rayo Vallecano",
      "Real Betis",
      "Real Madrid",
      "Real Sociedad",
      "Sevilla",
      "Valencia",
      "Valladolid",
      "Villarreal",
    ];

    const jsonTeams = [];
    teamsLaLiga.forEach((teamName) => {
      jsonTeams.push({
        name: deburr(teamName),
        slug: slugify(teamName, { lower: true, remove: /[*+~.()'"!:@]/g }),
        displayName: teamName,
        league: "la-liga"
      });
    });

    console.log(jsonTeams);
  })();
  </script>
</head>
<body>
</body>
</html>
```

Note: the call to `slugify(teamName, { lower: true, remove: /[*+~.()'"!:@]/g })` includes the remove option that takes a Regex expression to get rid of characters '*+~.()'"!:@' when creating the slugs.

The script above resulted in a JSON array formatted exactly as I wanted it:

```json
[{
  displayName: "Almería",
  league: "la-liga",
  name: "Almeria",
  slug: "almeria"
}, {
  displayName: "Athletic Bilbao",
  league: "la-liga",
  name: "Athletic Bilbao",
  slug: "athletic-bilbao"
}, {
  displayName: "Atlético Madrid",
  league: "la-liga",
  name: "Atletico Madrid",
  slug: "atletico-madrid"
}, {
  displayName: "Barcelona",
  league: "la-liga",
  name: "Barcelona",
  slug: "barcelona"
}, {
  displayName: "Cádiz",
  league: "la-liga",
  name: "Cadiz",
  slug: "cadiz"
}, {
  displayName: "Celta Vigo",
  league: "la-liga",
  name: "Celta Vigo",
  slug: "celta-vigo"
}, {
  displayName: "Elche",
  league: "la-liga",
  name: "Elche",
  slug: "elche"
}, {
  displayName: "Espanyol",
  league: "la-liga",
  name: "Espanyol",
  slug: "espanyol"
}, {
  displayName: "Getafe",
  league: "la-liga",
  name: "Getafe",
  slug: "getafe"
}, {
  displayName: "Girona",
  league: "la-liga",
  name: "Girona",
  slug: "girona"
}, {
  displayName: "Mallorca",
  league: "la-liga",
  name: "Mallorca",
  slug: "mallorca"
}, {
  displayName: "Osasuna",
  league: "la-liga",
  name: "Osasuna",
  slug: "osasuna"
}, {
  displayName: "Rayo Vallecano",
  league: "la-liga",
  name: "Rayo Vallecano",
  slug: "rayo-vallecano"
}, {
  displayName: "Real Betis",
  league: "la-liga",
  name: "Real Betis",
  slug: "real-betis"
}, {
  displayName: "Real Madrid",
  league: "la-liga",
  name: "Real Madrid",
  slug: "real-madrid"
}, {
  displayName: "Real Sociedad",
  league: "la-liga",
  name: "Real Sociedad",
  slug: "real-sociedad"
}, {
  displayName: "Sevilla",
  league: "la-liga",
  name: "Sevilla",
  slug: "sevilla"
}, {
  displayName: "Valencia",
  league: "la-liga",
  name: "Valencia",
  slug: "valencia"
}, {
  displayName: "Valladolid",
  league: "la-liga",
  name: "Valladolid",
  slug: "valladolid"
}, {
  displayName: "Villarreal",
  league: "la-liga",
  name: "Villarreal",
  slug: "villarreal"
}]
```

