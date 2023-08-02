---
title: SST - Cannot use GraphQLScalarType "Boolean" from another module or realm
description: Weird console error when using pothos as a GraphQL schema builder for Typescript in SST
pubDate: 2022-07-24
tags:
  - Pothos
  - Graphql
  - sst.dev
---

I've been playing around with [SST](https://sst.dev) over the last few days. SST is a "framework that makes it easy to build serverless apps". It builds on top of the AWS CDK (Amazon's cloud development kit) and comes with a set of impressive features including a live lambda dev environment, a management dashboard, debugging with breakpoints in VS Code as well as out-of-the-box support for JS and TS (using esbuild), Go, Python, C#, and F#.

SST is infrastructure-as-code on steroids. It comes with higher-level constructs designed specifically for serverless apps resulting in code that looks mighty impressive:

```js
import * as sst from '@serverless-stack/resources';

import { StorageStack } from './StorageStack';
import { ApiStack } from './ApiStack';
import { AuthStack } from './AuthStack';
import { WebStack } from './WebStack';
import { CronStack } from './CronStack';

export default function main(app: sst.App): void {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: 'nodejs16.x',
    srcPath: 'services',
    bundle: {
      format: 'esm',
    },
  });

  app
    .stack(StorageStack).stack(ApiStack).stack(AuthStack).stack(CronStack).stack(WebStack);
}
```

## Cannot use GraphQLScalarType "Boolean" from another module or realm.

But I digress. While learning and ins-and-outs of the framework (I am nowhere near done), I used the `create sst` command to set up an app and followed the SST guide to add different stack constructs. I chose Vue.js for my web stack and managed to query the GraphQL endpoint without issue. I was playing with the Cron construct when I suddenly noticed the following error in my console:

```js
Failed to extract schema from pothos
Error: Cannot use GraphQLScalarType "Boolean" from another module or realm.

Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

https://yarnpkg.com/en/docs/selective-version-resolutions

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior. The data from one
version used in the function from another could produce confusing and
spurious results.
    at instanceOf (/Users/Projects/nonstopfootball/node_modules/graphql/jsutils/instanceOf.js:44:19)
    at isScalarType (/Users/Projects/nonstopfootball/node_modules/graphql/type/definition.js:117:37)
    at sortNamedType (/Users/Projects/nonstopfootball/node_modules/graphql/utilities/lexicographicSortSchema.js:99:36)
    at keyValMap (/Users/Projects/nonstopfootball/node_modules/graphql/jsutils/keyValMap.js:29:27)
    at lexicographicSortSchema (/Users/Projects/nonstopfootball/node_modules/graphql/utilities/lexicographicSortSchema.js:31:44)
    at Module.generate (file:///Users/Projects/nonstopfootball/node_modules/@serverless-stack/core/dist/pothos/generate.js:149:40)
    at build (file:///Users/Projects/nonstopfootball/node_modules/@serverless-stack/core/dist/cli/PothosBuilder.js:12:28)
```

I tried to revert code, Command+Z etc, but no luck. I was commenting things left, right and center but the error would not go away.

Dax from the [SST discord](https://discord.com/channels/983865673656705025/985224097342582865/997233904698277898) mentioned this might be a node_modules conflict when asked about the issue a few days ago, however, I was intrigued why this problem was suddenly occurring for me when I was able to run GraphQL without issue only a few moments ago.

Then it struck me! SST is configured with workspaces to hoist modules into the root node_modules folder. I had used yarn to install sst initially, but, while playing around with the Cron construct I went and used npm to install rss-parser (force of habit). As a result, this mixing of yarn and npm commands caused a conflict within my node_modules resulting in the above errors

To fix the issue, I removed all node_modules folders with `rm -Rf node_modules` and used yarn to install. I was able to continue working and the conflict was resolved.

Note: If this fix does not work for you, you may have to resort to adding a resolutions section to your graphql folder's package.json file as follows to force the use of the correct graphql library.

```json
"resolutions": {
  "graphql": "16.5.0"
}
```
