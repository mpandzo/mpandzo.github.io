---
title: Serverless Architecture - Real world examples
description: Serverless architecture and real world examples of usecases where it proves invaluable
pubDate: 2023-01-15
tags:
  - Serverless
  - Event-driven
  - Lambda
  - Serverless functions
---

The term serverless has been around for the past 7 or 8 years. It's one of a set of words people associate with cutting edge and modern stacks (I am talking about you jamstack, headless, cloud-native, event-driven architecture etc).

It's often defined as the concept of "enabling users to write and deploy code without the worry of managing the underlying infrastructure".

In layman's terms, serverless works as follows:

- an environment is provisioned via script or ui
- code is deployed automatically via CI/CD
- you pay only for the resources your application uses
- you don't worry about managing servers, load balancers, reverse proxies etc
- your infrastructure scales to handle traffic surges and spikes
- a failed function instance is simply replaced by another instance

You may have seen the above written many times over. It's very much common knowledge - in dev circles at least.

There are many different approaches to doing serverless. Vercel, Netlify, Render and other PaaS (Platform as a Service) providers all have their flavor of serverless functions available for use. SST.dev and Serverless Framework are just two frameworks built on top of serverless technology. Of course, you can also use AWS Lambda, Google Cloud Functions and Microsoft Azure Functions directly to the same effect.

But, many times, real world examples are omitted from the discussion.

When does serverless really shine?

## Image resizing on the fly

We were asked to refactor a very large website (100 million+ page views per month). The refactor aimed to optimize performance and architect the codebase for scalability.

During the obligatory site audit, we identified a number of potential candidates for improvement. Amongst them was the way images stored in an S3 bucket were being handled.

The legacy system optimized and resized images during image upload. This meant that any subsequent design changes that included image dimension changes required running a crob job to mass resize the original images to match the newly specified dimensions. With potentially hundreds of thousands of images to resize, this was a huge drain on resources.

We replaced this process with an AWS Lambda function that fires on-demand when there is a failed S3 bucket endpoint request.

When an image that is requested from S3 is not found, the bucket routing sends the request to the API Gateway which in turn fires a Lambda function to serve the request. The Lambda function resizes the image, stores the generated variations in S3 and serves the resized image. Any subsequent requests for the same variation will simply hit the appropriate S3 bucket-stored entry without further Lambda calls.

Because of the scalable nature of AWS Lambda, this revised mechanism is able to handle millions of requests without blinking an eye which is very different to the server strain caused by running a cronjob to resize hundreds of thousands of entries.

Though AWS has more recently improved their offering with the Serverless Image Handler <a href="https://aws.amazon.com/answers/web-applications/serverless-image-handler">[1]</a> you can still see the more pedestrian solution we used in the serverless-image-resizing archived repo <a href="https://github.com/amazon-archives/serverless-image-resizing">[2]</a>.

## Handling push notifications at scale

An admin flow we implemented included the processing of gamified data for thousands of customers and the subsequent sending of push notifications (sms & in-app) to each.

We implemented a Lambda function to do the data processing. The Lambda function then deferred to AWS SNS (simple notification service) to handle the pushes.

Once the function completed it's processing it marked the entry as completed.

We had a simple progressbar display in the dashboard with a periodic check of the database to display progress.

## Event tracking

A client was using a bespoke event tracking script for tracking various user initiated events. This script turned out to be a bottleneck when handling thousands of requests.

We rewrote the functionality by using AWS Lambda. Similar to the original script, the Lambda function gets triggered on specific events, such as a user clicking a button or submitting a form. However, because of the nature of Lambda functions, scaling is not an issue, and the bottleneck is removed.

I hope examples from our own development journey help you get a better understanding of the benefits of utilizing serverless infrastructure for more optimized performance and reduced cost.
