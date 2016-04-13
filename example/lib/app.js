comments = new Meteor.Collection("comments");
Meteor.startup(function(){
  if(!comments.find().count())
  _(100).times(function(n){
    comments.insert({'post': n, 'content': _.random(1, 9999999) });
   });

});

if(Meteor.isClient){
  Template.body.created = function() {
  // Enable infinite scrolling on this template
  this.infiniteScroll({
    perPage: 10,                        // How many results to load "per page"
    query: {},
                                        // Useful when you want the data to persist after this template
                                        // is destroyed.
    collection: 'comments',             // The name of the collection to use for counting results
    publication: 'CommentsInfinite'     // (optional) The name of the publication to subscribe.
                                        // Defaults to {collection}Infinite
  });
};
  Template.body.helpers({
    comments: function() {
      return comments.find({ },  {
          sort: {
              created: 1
          }
      });
    }
  });
}

if(Meteor.isServer){
    Meteor.publish('CommentsInfinite', function(limit, query) {
        console.log(`${limit} ${JSON.stringify(query)}`);
        // Don't use the query object directly in your cursor for security!
        // var selector = {};
        // check(limit, Number);
        // check(query.name, String);
        // // Assign safe values to a new object after they have been validated
        // selector.name = query.name;

        return comments.find(query, {
          limit: limit,
          sort: {
            created: 1
          }
        });
    });
}
