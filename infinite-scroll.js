'use strict';

/**
 * Triggers 'triggerInfiniteLoad' event when the user has scrolled
 * to the trigger point.
 */
function triggerLoadMore() {
  if ($('.infinite-load-more').isAlmostVisible()) {
    $(document).trigger('triggerInfiniteLoad');
  }
}

/**
 * Attempt to trigger infinite loading when resize and scroll browser
 * events are fired.
 */
Meteor.startup(function() {
  $(window).on('resize scroll', _.throttle(triggerLoadMore, 500));
});

/**
 * Attempt to trigger infinite loading when the route changes.
 */
Router.onAfterAction(function() {
  triggerLoadMore();
});

/**
 * jQuery plugin to determine whether an element is "almost visible".
 * @return {Boolean}
 */
jQuery.fn.isAlmostVisible = function jQueryIsAlmostVisible() {
  if (this.length === 0) {
    return;
  }
  var rect = this[0].getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (jQuery(window).height() * 2) &&
    rect.right <= jQuery(window).width()
  );
};

/**
 * Enable infinite scrolling on a template.
 */
Blaze.TemplateInstance.prototype.infiniteScroll = function infiniteScroll(options) {
  var tpl = this;

  /*
   * Create options from defaults
   */
  var _defaults = {
    // How many results to fetch per "page"
    perPage: 10,
    // The query to use when fetching our collection
    query: {},
    // Collection to use for counting the amount of results
    collection: null,
    // Publication to subscribe to, if null will use {collection}Infinite
    publication: null
  };
  options = _.extend({}, _defaults, options);

  // Validate the options
  check(options.perPage, Number);
  check(options.collection, String);
  check(options.publication, String);

  // Collection exists?
  if (!app.collections[options.collection]) {
    throw new Error('Collection does not exist: ', options.collection);
  }

  // Generate the publication name if one hasn't been provided
  if(!options.publication){
    options.publication = options.collection + 'Infinite';
  }
  var collection = app.collections[options.collection];

  // We use 'limit' so that Meteor can continue to use the OpLogObserve driver
  // See: https://github.com/meteor/meteor/wiki/Oplog-Observe-Driver
  // (There are a few types of queries that still use PollingObserveDriver)
  var limit = new ReactiveVar();

  // Retrieve the initial page size
  limit.set(options.perPage);

  // Create subscription to the collection
  tpl.autorun(function() {
    tpl.infiniteSub = tpl.subscribe(options.publication, limit.get(), options.query);
  });

  // Create infiniteReady reactive var that we can use to track
  // whether or not the first result set has been received.
  var firstReady = new ReactiveVar(false);
  tpl.infiniteReady = function(){
    return firstReady.get() === true;
  };

  // Set infiniteReady to true when our subscription is ready
  tpl.autorun(function(){
    var ready = tpl.infiniteSub.ready();
    if(firstReady.get() !== true){
      firstReady.set(ready);
    }
  });

  /**
   * Load more results for this collection.
   */
  var loadMore = function() {
    var count = collection.find(options.query, {
      reactive: false
    }).count();

    // Increase the limit if it looks like there are more records
    if (count >= limit.get()) {
      tpl.$('.infinite-load-more').addClass('loading');
      limit.set(limit.get() + options.perPage);
    }else{
      tpl.$('.infinite-load-more').removeClass('loading');
    }
  };

  // Trigger loadMore when we've scrolled/resized close to revealing .load-more
  $(document).off('triggerInfiniteLoad');
  $(document).on('triggerInfiniteLoad', loadMore);
};
