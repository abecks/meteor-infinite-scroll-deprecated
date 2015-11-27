# Meteor Infinite Scroll
This is a fork of https://github.com/abecks/meteor-infinite-scroll
Watch the CHANGELOG.md for fixes/features

**Enables infinite scrolling at the template level**. This package allows you to increment the `limit` parameter of a MongoDB query as the user scrolls down the page. This allows Meteor to use the Oplog Observe Driver for your query, as well as leaving you in control of your publications.

## Usage:

Call `this.infiniteScroll` in the `created` or `rendered` functions for your template.

```js
Template.comments.created = function() {
  // Enable infinite scrolling on this template
  this.infiniteScroll({
    perPage: 20,                        // How many results to load "per page", optional if using cacheLimit option in SubsManager
    query: {                            // The query to use as the selector in our collection.find() query
        post: 71
    },
    subManager: new SubsManager(),      // (optional) Add meteorhacks:subs-manager to set the subscription on
                                        // Useful when you want the data to persist after this template 
                                        // is destroyed. (works great with ground:db)
    collection: 'Comments',             // The name of the collection to use for counting results
    publication: 'CommentsInfinite',    // The name of the publication to subscribe.
    countName: 'CommentsInfiniteCount'  // (optional) The name of your Count pub, will use <publication>Count as default value
  });
};
```

Create a publication on the server:
Note that you need to add the Counts pub!

```js
if(Meteor.isServer){
    Meteor.publish('commentsInfinite', function(limit, query) {
        // Don't use the query object directly in your cursor for security!
        var selector = {};
        check(limit, Number);
        check(query.name, String);
        // Assign safe values to a new object after they have been validated
        selector.name = query.name;
        
        // Add the Count to your pub!
        Counts.publish(this, "commentsInfiniteCount", Collections.Comments.find(selector, {limit: limit}));

        return Collections.Comments.find(selector, {
          limit: limit,
          // Using sort here is necessary to continue to use the Oplog Observe Driver!
          // https://github.com/meteor/meteor/wiki/Oplog-Observe-Driver
          sort: {
            created: 1
          }
        });
    });
}
```

Render your data as usual. Render the `{{> infiniteScroll }}` template after your data is rendered:

```handlebars
<template name="comments">
    {{#each comments}}
        {{content}}
    {{/each}}
    {{> infiniteScroll }}
</template>
```
> Infinite Scroll will increase the `limit` of the subscription as the `{{> infiniteScroll }}` template approaches the viewport.

Provide data to the template as you usually would. Use `infiniteReady()` like you would use `subscriptionsReady()` on the template instance.
Note: for offline support with ground:db just return a Cursor without check.
```js
Template.comments.helpers({
  comments: function() {
    // Don't show anything until the first result set has been received
    if(!Template.instance().infiniteReady()){ //Comment this out when you want offline support
      return;
    }
    return app.collections.Comments.find({ post: 71 },  {
        sort: {
            created: 1
        }
    });
  }
});
```

### Only `limit`

Using `skip` will cause Meteor to use the Polling Observe Driver (see [Oplog Observe Driver in the Meteor Wiki](https://github.com/meteor/meteor/wiki/Oplog-Observe-Driver)). For a full pagination solution that uses skip, check out [alethes:pages](https://github.com/alethes/meteor-pages).

## Styling the loader
The `{{> infiniteScroll }}` template renders (uses sacha:spin):
```html
<template name="infiniteScroll">
  <div class="loadingInfinite">{{>spinner}}</div>
</template>
```

When the subscription is loading more data, `.loadingInfinite` will receive the class `loading`. It will be removed when the subscription is marked as ready.