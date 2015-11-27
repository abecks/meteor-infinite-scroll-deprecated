Package.describe({
  name: 'dmat:infinite-scroll',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Template level infinite scrolling. API included',
  // URL to the Git repository containing the source code for this package.
  //git: 'https://github.com/abecks/meteor-infinite-scroll', Todo: add to git later for feedback
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use(['jquery', 'reactive-var', 'iron:router@1.0.12', 'templating', 'sacha:spin@2.3.1', 'tmeasday:publish-counts@0.7.2'], 'client');
  api.addFiles('infinite-scroll.js', 'client');
  api.addFiles('infiniteScroll.html', 'client');
  api.addFiles('infiniteScroll.css', 'client');
});
