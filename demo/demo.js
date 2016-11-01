import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { check, Match } from 'meteor/check';

const Comments = new Mongo.Collection("Comments");

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (!Comments.find().count()) {
            _(100).times(function (n) {
                Comments.insert({
                    post: 71,
                    content: _.random(1, 9999999),
                    created: new Date(),
                });
            });
        }
    });

    Meteor.publish('CommentsInfinite', function (limit, query) {
        // Don't use the query object directly in your cursor for security!
        var selector = {};
        check(limit, Number);
        check(query.post, Number);

        // Assign safe values to a new object after they have been validated
        selector.post = query.post;

        return Comments.find(selector, {
            limit: limit,
            // Using sort here is necessary to continue to use the Oplog Observe Driver!
            // https://github.com/meteor/meteor/wiki/Oplog-Observe-Driver
            sort: {
                created: 1
            }
        });
    });
}

if (Meteor.isClient) {
    Template.comments.helpers({
        comments: function () {
            return Comments.find({}, {
                sort: {
                    created: 1
                }
            });
        }
    });

    Template.comments.onCreated(function () {
        // Enable infinite scrolling on this template
        this.infiniteScroll({
            perPage: 20,                        // How many results to load "per page"
            query: {                            // The query to use as the selector in our collection.find() query
                post: 71
            },
            //subManager: new SubsManager(),      // (optional, experimental) A meteorhacks:subs-manager to set the subscription on
            // Useful when you want the data to persist after this template
            // is destroyed.
            collection: 'Comments',             // The name of the collection to use for counting results
            publication: 'CommentsInfinite',    // (optional) The name of the publication to subscribe.
                                                // Defaults to {collection}Infinite
            container: window,                  // (optional) Selector to scroll div.
            // loadingTemplateName: 'loading'   // (optional) Name Of loading template
        });
    });
}