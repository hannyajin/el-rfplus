angular
  .module('rfpApp', [
    'ui.router'
    ])
  .config(['$urlRouterProvider', '$stateProvider', 
    function ($urlRouterProvider, $stateProvider) {
      $urlRouterProvider.otherwise('/');
      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'templates/home.html',
          controller: 'homeCtrl'
        })
        .state('about', {
          url: '/about',
          templateUrl: 'templates/about.html',
          controller: 'aboutCtrl'
        })
        .state('docs', {
          url: '/docs',
          templateUrl: 'templates/docs.html',
          controlller: 'docsCtrl'
        })
  }])