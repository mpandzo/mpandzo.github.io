---
title: WooCommerce blocks and woocommerce_order_item_name and woocommerce_cart_item_name filter problems
description: Missing filters for cart and order item name in WooCommerce blocks
pubDate: 2024-01-23
tags:
  - WooCommerce blocks
  - cart item name
  - order item name
---

Block themes were formally introduced to WordPress core as of WordPress 5.9. They are considered the future of the WordPress project and are built entirely out of blocks.

Blocks are the components used to edit content using the new WordPress block editor. Quite <a href="https://wordpress.org/documentation/article/blocks-list/">a few blocks</a> are available for use within WordPress. The block editor itself (Gutenberg) has been the default editor for WordPress since WordPress 5.0 (2018).

This paradigm shift (classic to block) is something that we have bore witness to with every new WordPress upgrade since. Other products in the Automattic family have also followed suite adopting the "block way" of doing things, as have many external plugins in general.

This is the case with WooCommerce as well. For instance, if you were used to the `woocommerce_cart` and `woocommerce_checkout` shortcodes, you'll find that they are no longer used by default when WooCommerce creates new Cart and Checkout pages. Instead, these pages are pre-populated with their WooCommerce block equivalents.

You will also notice that this architectural change means that some actions or filters you may have used in WordPress classic do not have their equivalent in the block system. For example, <a href="https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce-blocks/docs/third-party-developers/extensibility/hooks/migrated-hooks.md">only a few</a> WooCommerce core hooks were brought across to WooCommerce blocks.

Though this occurrence is most likely a result of thoroughly thought out decisions, it does create significant problems for developers maintaining legacy and existing themes.

A case in point are the `woocommerce_order_item_name` and `woocommerce_cart_item_name` filters which allowed the developer to modify the product title in the cart and checkout views. These filters were especially useful if a theme or plugin was using WooCommerce to sell dynamic products that needed modification on the fly.

After quite a bit of digging I was able to find a workaround for this particular issue by following the documentation found <a href="https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce-blocks/docs/third-party-developers/extensibility/checkout-block/available-filters.md#cart-line-items-filters">here</a>. Specifically, I registered a callback for the `cartItemName` filter using the `registerCheckoutFilters` method in a javascript file embedded in the theme's footer.php file and I modified my product title within this callback. As you can see from the code below, I added an exclamation point `!` at the end of the title.

```
const { registerCheckoutFilters } = window.wc.blocksCheckout;

const itemNameCallback = (defaultValue, extensions, args) => {
	return `${defaultValue}!`;
};

registerCheckoutFilters( 'my-plugin-namespace', {
	itemName: itemNameCallback,
} );
```

But, you may ask how is this related to `woocommerce_order_item_name` and `woocommerce_cart_item_name` filter which (in classic themes) runs server-side and allows me to modify the item title based on, for example, the variation_id or product_id? You are correct, to get actual data into the callback I used a filter that did make it across into WooCommerce blocks - `woocommerce_get_item_data`.

In woocommerce_get_item_data I was able to access the variation_id, product_id and item_key which allowed me to retrieve product specific attributes that I was then able to pass into the frontend via the `args.cartItem.item_data` property.


```
  add_action('woocommerce_get_item_data', 'my_woocommerce_get_item_data', 10, 2);

  function my_woocommerce_get_item_data( $data, $cart_item ) {
    if ($cart_item['variation_id'] && $cart_item['product_id'] && $cart_item['key']) {
      $variation_id = (int)$cart_item['variation_id'];
      $product_id = (int)$cart_item['product_id'];
      $item_key = $cart_item['key'];

      $item_title = '';
      /*
        ... custom code where I extract variation attributes used to curate my item title
      */

      $data[] = array(
        'key'     => '_my_item_title',
        'value'   => $item_title,
        'hidden'  => true
      );
    }

    return $data;
  }
```

The `hidden` property of the item added to the $data array is there to indicate that this particular item should not be displayed within the item markup when the iteam is displayed in the cart, checkout and summary views.

Note: in the code above $item_title cannot contain html tags because all html tags are <a href="https://github.com/woocommerce/woocommerce/blob/a943de24fa9517ae18e7b21f76169d8794b78350/plugins/woocommerce/src/StoreApi/Schemas/V1/CartItemSchema.php#L128">stripped</a> before being passed to the frontend.

My modified frontend javascript script is then able to access the `_my_item_title` field as follows:

```
const { registerCheckoutFilters } = window.wc.blocksCheckout;

const itemNameCallback = (defaultValue, extensions, args) => {
  if (args?.cartItem?.item_data?.length > 0) {
    const item_title = args?.cartItem?.item_data?.find(item => item.key === '_my_item_title')?.value;
    if (item_title) {
      return item_title;
    }
  }

	return defaultValue;
};

registerCheckoutFilters( 'my-plugin-namespace', {
	itemName: itemNameCallback,
} );
```

Having gone through this process I can foresee continued and significant problems for classic theme and plugin developers intending to achieve continued compatibility within the WordPress ecosystem - especially considering the number of and complexity of existing plugins and themes that are built on the classic WordPress system. Tremendous effort and expenditure will be needed to port functionality from the classic to block system.
