---
title: Create svg graph plots with matplotlib's pyplot
description: I used matplotlib library's pyplot function to create beautiful svg plots
pubDate: 2023-08-09
tags:
  - matplotlib
  - pyplot
  - graphs
---

I needed to plot data in a line graph for the <a href="/alb-vs-nlb-aws-load-balancers-benchmarked-for-web-applications" title="ALB vs NLB - AWS load balancers benchmarked for web applications">ALB vs NLB</a> post so I quickly threw together a python function to do the job.

The function relies on the <a href="https://matplotlib.org/" title="Matplotlib library" target="_blank" rel="nofollow">matplotlib library</a> which you must install with `pip install matplotlib` first.

```py
import csv
import matplotlib.pyplot as plt

def plot_line_graph_from_csv(csv_file_path, svg_file_path, ylabel, set_1_column, set_2_column):
    attempts = []
    set1_values = []
    set2_values = []

    with open(csv_file_path, mode='r') as file:
        reader = csv.reader(file)
        # The first 2 rows in the csv were headers so I call next twice to skip both
        next(reader)
        next(reader)
        for row in reader:
            attempts.append(int(row[0]))
            set1_values.append(float(row[set_1_column]))
            set2_values.append(float(row[set_2_column]))

    plt.plot(attempts, set1_values, color='blue', label='ALB')
    plt.plot(attempts, set2_values, color='red', label='NLB')

    plt.xlabel('Attempts')
    plt.ylabel(ylabel)
    # plt.title('Line Graph of Two Sets of Values over 100 Attempts')
    plt.legend()
    plt.grid(True)

    # Save the graph as an SVG file
    plt.savefig(svg_file_path, format='svg')

    # plt.show() can be called to also launch and show the image immediately
```

A subsequent call to `plot_line_graph_from_csv('5-5-100-alb-vs-nlb.csv', 'total.svg', 'Total (ms)', 4, 9);` results in the following graph being created.

<div class="w-full">
  <img src="/assets/alb-vs-nlb/total.svg" alt="Total time" class="w-full" />
</div>

The plot function documentation can be found below for further perusal:

<a href="https://matplotlib.org/stable/api/_as_gen/matplotlib.pyplot.plot.html" title="matplotlib.pyplot plot function" target="_blank" rel="nofollow">matplotlib.pyplot.plot</a>
