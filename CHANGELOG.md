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