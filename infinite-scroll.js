'use strict';

InfiniteScroll = {};

/**
 * Triggers 'triggerInfiniteLoad' event when the user has scrolled
 * to the trigger point.
 */
function triggerLoadMore() {
  if ($('.infinite-load-more').isAlmostVisible()) {
    $(document).trigger('triggerInfiniteLoad');
  }
}
InfiniteScroll.triggerLoadMore = triggerLoadMore;

/**
 * Attempt to trigger infinite loading when resize and scroll browser
 * events are fired.
 */
Meteor.startup(function() {
  $(window).on('resize scroll', _.throttle(triggerLoadMore, 500));
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
    rect.bottom <= (jQuery(window).height() * 1.5) &&
    rect.right <= jQuery(window).width()
  );
};

/**
 * Enable infinite scrolling on a template.
 */
Blaze.TemplateInstance.prototype.infiniteScroll = function infiniteScroll(options) {
  var tpl = this, _defaults, collection, subManagerCache, limit, subscriber, loadMore;

  /*
   * Create options from defaults
   */
  _defaults = {
    // How many results to fetch per "page"
    perPage: 10,
    // The query to use when fetching our collection
    query: {},
    // The sorting instructions for MongoDB
    sort: {},
    // The subscription manager to use (optional)
    subManager: null,
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

  //using collection instances package here to scan all collection and checks ours exists
  //may be a more elegant packageless solution but coudn't find anything
  let collectionExists = Meteor.Collection.getAll().find(c => c.name === options.collection);
    // Collection exists?
  if (!collectionExists) {
    throw new Error('Collection does not exist: ', options.collection);
  } else {
    //set collection to cursor
    collection = collectionExists.instance;
  }

  // Generate the publication name if one hasn't been provided
  if(!options.publication){
    options.publication = options.collection + 'Infinite';
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
  limit = new ReactiveVar();

  // If the query changes, the limit must reset
  if(options.query instanceof ReactiveVar){
    tpl.autorun(function(){
      options.query.get();
      limit.set(options.perPage);
    });
  }

  // Retrieve the initial page size
  if(subManagerCache && subManagerCache.limit){
    limit.set(subManagerCache.limit);
  }else{
    limit.set(options.perPage);
  }

  // Create subscription to the collection
  tpl.autorun(function() {
    // Rerun when the limit changes
    var lmt = limit.get();

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

    var query;
    if(options.query instanceof ReactiveVar){
      query = options.query.get();
    }else{
      query = options.query;
    }

    var sort;
    if(options.sort instanceof ReactiveVar){
      sort = options.sort.get();
    }else{
      sort = options.sort;
    }

    tpl.infiniteSub = subscriber.subscribe(options.publication, lmt, query, sort, null);
  });

  // Check to see if we need to load more
  tpl.autorun(function(){
    if(tpl.infiniteSub.ready()){
      Tracker.afterFlush(triggerLoadMore);
    }
  });


  /**
   * Load more results if our limit is below the total
   */
  loadMore = function() {

    var query;
    if(options.query instanceof ReactiveVar){
      query = options.query.get();
    }else{
      query = options.query;
    }

    var lmt = limit.get(), results = collection.find(query).count();
    if(results >= lmt){
      limit.set(lmt + options.perPage);
    }
  };

  // Trigger loadMore when we've scrolled/resized close to revealing .load-more
  $(document).off('triggerInfiniteLoad');
  $(document).on('triggerInfiniteLoad', loadMore);
};


Template.infiniteScroll.helpers({

  loading: function(){

    // Loop through parent templates until we find infiniteSub
    var tpl = Template.instance();
    while(!tpl.infiniteSub){
      var parent = tpl.parents();
      if(!parent){
        break;
      }
      tpl = parent;
    }

    return !tpl.infiniteSub.ready();
  }

});
