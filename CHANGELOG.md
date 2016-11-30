## 1.0.2
- Clear window events when the template is destroyed, fixes #15

## 1.0.1
- Add back loadingTemplateName helper
- Add default loading indicator as a template

## 1.0.0
- Customizable container and loading template (thanks @VolodymyrTymets)
- Removed dburles:mongo-collection-instances dependency (thanks @mizsha)
- Rewritten demo application

## 0.9.2
- Removed `dburles:mongo-collection-instances` dependency, thanks @mizsha

## 0.9.1
- Added `ecmascript` dependency, thanks @JulianKingman

## 0.9.0
- Thanks to @mikepaszkiewicz for his contribution to this release.
- Added example application
- Collection is now looked up by name
- No more ``app`` globals

## 0.8.0
- Remove dependency on Counts, didn't work out so well
- Customizable class on the loader template
- Exposes `InfiniteScroll.triggerLoadMore` so you can use custom scroll regions (eg. `this.$('.results-list').on('resize scroll', _.throttle(InfiniteScroll.triggerLoadMore, 300));`)

## 0.7.2
- Added check package to dependencies

## 0.7.0
- Add sort functionality

## 0.6.1
- Added Tracker.afterFlush when checking to load more data

## 0.6.0
- Overhauled reliability of the loader template and triggers
- Removed `Template.instance().infiniteReady()` in favor of `Template.instance().infiniteSub.ready()`
- New dependency on `tmeasday:publish-counts` for more reliable loading

# 0.5.0
- Fixed an issue with tall window heights

# 0.4.0
- Requires Meteor 1.2 or greater
- Fixed a bug where the loader would not show on the initial subscription load
- Fixed a bug where the subscription query would be mutated by the call to Meteor.subscribe

# 0.3.0
- Minor fixes

# 0.2.0
- Added `subManager` property to set the subscription on a `meteorhacks:subs-manager` Subscription Manager instead of the template. This allows the data to persist when the template is destroyed.

# 0.1.0
- Initial release
