Package.describe({
  name: 'abecks:infinite-scroll',
  version: '0.1.0',
  // Brief, one-line summary of the package.
  summary: 'Template level infinite scrolling.',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.use(['jquery', 'less', 'reactive-var', 'iron:router', 'templating'], 'client');
  api.addFiles('infinite-scroll.js', 'client');
  api.addFiles('infinite-scroll.less', 'client');
  api.addFiles('infiniteScroll.html', 'client');
});
