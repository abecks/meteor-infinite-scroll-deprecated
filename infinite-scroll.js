'use strict';

/**
 * Triggers 'triggerInfiniteLoad' event when the user has scrolled
 * to the trigger point.
 */
function triggerLoadMore() {
  if ($('.loadingInfinite').isAlmostVisible()) {
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
  var tpl = this, _defaults, collection, countName, subManagerCache, limit, subscriber, firstReady, loadMore;

  /*
   * Create options from defaults
   */
  _defaults = {
    // How many results to fetch per "page"
    perPage: 10,
    // The query to use when fetching our collection
    query: {},
    // The subscription manager to use (optional)
    subManager: null,
    // Collection to use for counting the amount of results
    collection: null,
    // Publication to subscribe to
    publication: null,
    // (optional) Count name, if null will use <publication>Count as default
    countName: null

  };
  options = _.extend({}, _defaults, options);

  // Validate the options
  check(options.perPage, Number);
  check(options.collection, String);
  check(options.publication, String);

  // Collection exists?
  if (!Collections[options.collection]) {
    throw new Error('Collection does not exist: ', options.collection);
  }

  collection = Collections[options.collection];

  // Generate Default name if null is given

  if (typeof options.countName !== "undefined" && options.countName !== null) {
    countName = options.countName;
  }else{
    // Generate default Count name
    countName = options.publication + "Count";
  }

  // If we are using a subscription manager, cache the limit variable with the subscription
  if(options.subManager){
    // Create the cache object if it doesn't exist
    if(!options.subManager._infinite){
      options.subManager._infinite = {};
      options.subManager._infinite[options.publication] = {};
    }
    subManagerCache = options.subManager._infinite[options.publication];
  }

  // We use 'limit' so that Meteor can continue to use the OpLogObserve driver
  // See: https://github.com/meteor/meteor/wiki/Oplog-Observe-Driver
  // (There are a few types of queries that still use PollingObserveDriver)
  tpl.limit = new ReactiveVar(options.perPage);
  tpl.loaded = new ReactiveVar(0);

  // Retrieve the initial page size
  if(subManagerCache && subManagerCache.limit){
    tpl.limit.set(subManagerCache.limit);
  }else{
    tpl.limit.set(options.perPage);
  }

  // Create subscription to the collection
  tpl.autorun(function() {
    // Rerun when the limit changes
    var lmt = tpl.limit.get();

    // If a Subscription Manager has been supplied, use that instead to create
    // the subscription. This is useful if you want to keep the subscription
    // loaded for multiple templates.
    if(options.subManager){
      subscriber = options.subManager;
      // Save the limit in the subscription manager so we can look it up later
      subManagerCache.limit = lmt;
    }else{
      subscriber = tpl;
    }

    tpl.infiniteSub = subscriber.subscribe(options.publication, lmt, options.query);
  });

  // Create infiniteReady reactive var that we can use to track
  // whether or not the first result set has been received.
  firstReady = new ReactiveVar(false);
  tpl.infiniteReady = function(){
    return firstReady.get();
  };

  //Todo: does this work with ground:db bug?
  // Set infiniteReady to true when our subscriptions are ready
  tpl.autorun(function(){
    if(tpl.infiniteSub.ready()) {
      firstReady.set(true);
      tpl.loaded.set(tpl.limit.get());
      tpl.$('.loadingInfinite').removeClass('loading');
    }
  });

  /**
   * Load more results for this collection.
   */
  loadMore = function() {
    // Get the count of the publication
    if(!Counts.has(countName)) {
      throw new Error("Counts does not exist for publication: ", countName)
    }
    var count = Counts.get(countName);

    // Increase the limit if it looks like there are more records
    if (count >= tpl.limit.get()) {
      tpl.$('.loadingInfinite').addClass('loading');
      tpl.limit.set(tpl.loaded.get() + options.perPage);
    }else{
      //Max results, no need for loader anymore
      tpl.$('.loadingInfinite').removeClass('loading');
    }
  };

  // Trigger loadMore when we've scrolled/resized close to revealing .loadingInfinite
  $(document).off('triggerInfiniteLoad');
  $(document).on('triggerInfiniteLoad', loadMore);
};
