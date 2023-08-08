---
title: ALB vs NLB - AWS load balancers benchmarked for web applications
description: I benchmarked the application and network loadbalancers on aws to find which one best suited by web application
pubDate: 2023-08-08
tags:
  - ALB
  - NLB
  - Load balancer
  - AWS
  - Benchmark
---

At AWS load balancers are called Elastic Load Balancers (ELBs). An ELB distributes incoming traffic among different targets thus ensuring *high availability*, *fault tolerance*, *scalability* and *efficiency*.

- High availability (__*__): ELBs can utilize targets in different availability zones. If a zone becomes unavailable, traffic is seamlessly diverted to targets in other zones.
- Fault tolerance: ELBs make use of healthchecks to ensure traffic is diverted away from unhealthy targets.
- Scalability: As incoming traffic varies over time, ELBs scale resources up or down on the fly to meet demand or reduce cost.
- Efficiency: ELBs spread traffic among targets evenly to ensure no single target is overwhelmed.

(__*__ for cross-region high-availability one could have Route 53 route traffic to multiple ELBs in different regions using a Routing Policy e.g. weighted routing policy)

Traffic targets can be EC2 instances, ip addresses, lambda functions or other ELBs - depending on the ELB type in use. AWS currently offers four types of load balancers:

- Classic Load Balancer - deprecated and being phased out
- Application Load Balancer (ALB)
- Network Load Balancer (NLB)
- Gateway Load Balancer

## Objective of the experiment

Out of the 4 types of load balancer offered by AWS I was particularly interested in how the ALB and NLB would fare when tasked to serve a web application under relatively heavy load. In particular, I was interested in how the high performing, low-latency NLB would stack up against the more HTTP-optimized ALB when handling what's almost always HTTP or layer 7 (<a href="https://en.wikipedia.org/wiki/OSI_model" target="_blank" rel="nofollow">OSI model</a>) traffic.

- The ALB works at layer 7 or the application layer - supports HTTP/1.1, HTTP/2, or gRPC.
- The NLB works at layer 4 or the transport layer - supports TCP, UDP.

## Setup and environment

For the purposes of this experiment I deployed two separate Elastic Beanstalk (Web server) environments in the North Virginia (us-east-1) region.

For both environments I chose the *Managed platform* option, *Node.js* (with defaults) and used *Sample application* application code. Under configuration presets I chose *High availability* while in the *Capacity* section I set *Min* and *Max* to 2 instances of *t3.micro* instance types.

The only difference for the two environments was the load balancer type set under *Load Balancer Type*.

- Environment __eb-elb-alb__ was set to use "Application load balancer" with the "Dedicated" option selected.
- Environment __eb-elb-nlb__ was set to use "Network load balancer".

I then clicked "Skip to review" to allow aws to configure everything else per default.

*Assumption: considering I ran my code from my local machine, I made the assumption that any variation in performance or speed at ISP/connection/DNS level was negligible.*

## Testing procedure and execution

Benchmarking was done with the help of the "Apache HTTP server benchmarking tool" <a href="https://httpd.apache.org/docs/2.4/programs/ab.html" target="_blank" rel="nofollow">ab</a>. The <a href="https://www.gnu.org/software/gawk/manual/gawk.html" target="_blank" rel="nofollow">GNU awk</a> text parsing tool was used to parse the ab tool results.

- I decided to eliminate any results that took longer than 5 seconds so ab's -t (timelimit) parameter was set to 5.
- I allowed a 5 second "cooldown" period for the environments between each test
- I performed 100 tests against each environment.
- Each test was executed with 50 concurrent connections with ab's -c (concurrent) parameter was set to 50.

A ab benchmarking test call with the above configuration where the endpoint is set to a dummy `http://alb-endpoint-address.us-east-1.elasticbeanstalk.com` url would look like this:

```sh
ab -c 50 -t 5 http://alb-endpoint-address.us-east-1.elasticbeanstalk.com
```

I used the following script to automate the benchmarking procedure:

```sh
#!/bin/bash

DEBUG=0
NUMBER_OF_TESTS=100
CONCURRENCY=50
SECONDS_BURST=5
SECONDS_COOLDOWN=5

# These endpoint addresses were replace with actual endpoint addresses
ALB_ENDPOINT=http://eb-test-elb-alb.us-east-1.elasticbeanstalk.com/
NLB_ENDPOINT=http://eb-test-elb-nlb.us-east-1.elasticbeanstalk.com/
ALB_LABEL=alb
NLB_LABEL=nlb

CURRENT_LABEL=$ALB_LABEL
CURRENT_ENDPOINT=$ALB_ENDPOINT

# Check the first argument to determine if we are testing the nlb or alb
if [ -n "$1" ] && [ "$1" = "nlb" ]; then
    CURRENT_LABEL=$NLB_LABEL
    CURRENT_ENDPOINT=$NLB_ENDPOINT
fi

OUT_FILE="$SECONDS_BURST-$SECONDS_COOLDOWN-$NUMBER_OF_TESTS-$CURRENT_LABEL.csv"

# Write the csv header row
echo "Attempt;Connect;Waiting;Processing;Total;" >> $OUT_FILE

for ((i = 1; i <= NUMBER_OF_TESTS; i++)); do
    echo "> Performing $i/$NUMBER_OF_TESTS benchmark for $CURRENT_LABEL..."

    # -c is concurrency, -t is timelimit, 2>&1 redirects stderr to same location as stdout
    ab -c $CONCURRENCY -t $SECONDS_BURST $CURRENT_ENDPOINT > tmp.txt 2>&1

    # awk does pattern matching for patterns enclosed within forward slashes
    # the condition is executed against each line of the input file
    # {print $4} is the awk action command, and refers to the fourth field (column) of the input line
    connect_median=$(awk '/Connect:/ {print $4}' tmp.txt)
    waiting_median=$(awk '/Waiting:/ {print $4}' tmp.txt)
    processing_median=$(awk '/Processing:/ {print $4}' tmp.txt)
    total_median=$(awk '/Total:/ {print $4}' tmp.txt)

    if [ "$DEBUG" -eq 1 ]; then
        echo $connect_median
        echo $processing_median
        echo $waiting_median
        echo $total_median
    fi

    rm tmp.txt

    # results for each test are written to the output file
    echo "$i;$connect_median;$waiting_median;$processing_median;$total_median;" >> $OUT_FILE

    echo "> Cooling down for $SECONDS_COOLDOWN seconds..."
    sleep $SECONDS_COOLDOWN
done
```

I've included comments to explain the key concepts within the code above.

Before executing a shell script file, you have to give it executable permissions with the `chmod +x my-script.sh` command. Once this is done, the the shell script file is to be called twice, once for benchmarking each load balancer type.

```sh
./my-script.sh alb
./my-script.sh nlb
```

## Results and observations

The results obtained (in csv format) can be downloaded here: <a href="/assets/alb-vs-nlb/alb-vs-nlb/5-5-100-alb.csv">alb</a>, <a href="/assets/alb-vs-nlb/alb-vs-nlb/5-5-100-nlb.csv">nlb</a>, <a href="/assets/alb-vs-nlb/alb-vs-nlb/5-5-100-alb-vs-nlb.csv">combined</a>.

I've plotted the comparison of connect, waiting, processing and total median times of ALB vs NLB in separate graphs with the x-axis always representing attempts.

<div class="grid grid-cols-1 gap-4 mt-2">
  <div>
    <h3>Connect</h3>
    <img src="/assets/alb-vs-nlb/connect.svg" alt="Connect time" />
  </div>
  <div>
    <h3>Waiting</h3>
    <img src="/assets/alb-vs-nlb/waiting.svg" alt="Waiting time" />
  </div>
  <div>
    <h3>Processing</h3>
    <img src="/assets/alb-vs-nlb/processing.svg" alt="Processing time" />
  </div>
  <div>
    <h3>Total</h3>
    <img src="/assets/alb-vs-nlb/total.svg" alt="Total time" />
  </div>
</div>

From observing the graphs one can deduce that while both the __connect__ and __waiting__ graphs do show some entries that do not follow the general pattern, on average the red line (NLB) is consistenly lower than the blue line (ALB) indicating faster performance.

The __processing__ graph shows an interestingly chaotic initial 20 tests where ALB beats NLB before the NLB line evens out and appears to show steadily better performance overall.

Across the 100 tests the connect, waiting and processing lines sum into an overall result shown in the __total__ graph that demonstrates the NLB load balancer edging out the ALP load balancer in terms of a steadily faster responses.

## Conclusion and caution

With the benchmarks done and results showing that NLB on average outperforms ALB in terms of median response times, I am of the opinion further research needs to be done before you choose the NLB load balancer over the ALB load balancer to handle your __Web application's__ traffic.

The Network load balancer will shine when handling UDP/TCP protocol traffic (eg. video streaming, gaming, messaging etc), however it does not do as much as the ALB does for HTTP/S traffic. The NLB does not come with SSL offloading, sticky sessions, request based routing and many of the other features that are built into the ALB. This in turn means if you require any such functionality, and you opt for the NLB, you will have to manage this yourself.

To learn more about the network and application load balancers follow the links below:

- <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html" title="Network load balancer" target="_blank" rel="nofollow">Network load balancer</a>
- <a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html" title="Application load balancer" target="_blank" rel="nofollow">Application load balancer</a>
