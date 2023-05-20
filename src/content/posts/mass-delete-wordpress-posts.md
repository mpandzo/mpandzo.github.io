---
title: How to Mass Delete thousands of WordPress Posts
description: How to safely delete thousands of WordPress posts
pubDate: 2023-5-20
tags:
  - WordPress
  - WP CLI
---

We recently had to get rid of around 200,000 low quality WordPress posts for a client. The posts were not exposed to the outside world, no longer served a purpose and were thus deemed surplus to requirements.

200,000 posts is quite a number, and I'll be honest, the thought of deleting such a volume of posts was quite daunting.

Before I get into what we did to complete this task, I'll quickly outline the different ways you can delete posts in WordPress.

- You can delete posts via the WordPress admin dashboard in Posts -> All Posts. You can either individually click the Trash link under each post or you can select multiple post checkboxes and use the Bulk Actions -> Move to Trash option. Either way, the deleted posts will make their way into the Trash which you then have to empty to make the deletion permanent. Obviously this option is not viable when it comes to deleting 200,000 posts.
- You can write a comprehensive MySql query to delete posts and related content from the database. The query would have to delete entries from at least the wp_posts, wp_postmeta, wp_term_relationships, wp_comments and wp_commentmeta tables. This approach could result in a database that contains orphaned records or data inconsistencies especially if your query was not comprehensive or precise enough.
- You can use one of the many WordPress plugins that provide Bulk or Mass Delete functionality. This approach is more practical than the previous two, however, with 200,000 posts to delete, and depending on how the plugin approaches the deletion task, you'd have to wait a SIGNIFICANT amount of time for all posts to be deleted (in case multiple ajax requests are made to delete posts in batches) or you'd run into continuous timeouts in case of a single POST request depending on your server's request timeout setting.
- Finally, you can delete posts using WordPress's CLI (command line interface).

We chose to use WordPress's CLI to achieve our objective and it did the job wonderfully.

"WP-CLI is the official command line tool for interacting with and managing your WordPress sites."

There is an easy to follow guide to install the tool that you can find <a href="https://make.wordpress.org/cli/handbook/guides/installing/">here</a>.

Once you've installed the cli and you are ready to get to work, cd into your website's root directory (the directory where your wp-config.php file is found) and run the following to test WP CLI's SELECT command:

```
wp post list --post_type='post' --format=ids --posts_per_page=5 --orderby=post_id --order=ASC
```

The above command will run if you have installed the WP CLI globally. In case you have installed the WP CLI by simply downloading the phar file to your root directory, you'd run the following instead:

```
php wp-cli.phar post list --post_type='post' --format=ids --posts_per_page=5 --orderby=post_id --order=ASC
```

If all is well, the command should return a list of ids like so:

```
12 13 14 15 16
```

Once you are certain that your WP CLI is configured and works, you can run your first delete query (keep in mind this delete is permanent!):

```
wp post delete $(wp post list --post_type='post' --format=ids --posts_per_page=5 --orderby=post_id --order=ASC) --force
```

As you can see from the command above, we are feeding the result of our SELECT command into the DELETE command thus 'telling' the DELETE command the ids of the posts we want to delete. The --force flag at the end is optional and is there to skip Trash and delete the posts permanently.

To check that your posts have indeed been deleted, you can rerun the SELECT command or you can access your WordPress dashboard and check there.

Once you are happy with the process, you can change your command to delete more posts in one go, via the posts_per_page parameter. E.g. we deleted posts in batches of 5000 like so:

```
wp post delete $(wp post list --post_type='post' --format=ids --posts_per_page=5000 --orderby=post_id --order=ASC) --force
```
