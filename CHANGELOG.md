# 0.3.0
- fork of https://github.com/abecks/meteor-infinite-scroll
- Fixes support for subs without SubsManager
- Handles Count correctly of the sub
- Compatible with ground:db if used with SubsManager

# 0.2.0
- Added `subManager` property to set the subscription on a `meteorhacks:subs-manager` Subscription Manager instead of the template. This allows the data to persist when the template is destroyed.

# 0.1.0
- Initial release