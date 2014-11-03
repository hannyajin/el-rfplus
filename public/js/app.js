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
        .state('stores', {
          url: '/stores',
          templateUrl: 'templates/storeList.html',
          controller: 'StoreListCtrl'
        })
        .state('docs', {
          url: '/docs',
          templateUrl: 'templates/docs.html',
        })
        .state('addstore', {
          url: '/addstore',
          templateUrl: 'templates/storeForm.html',
          controller: 'AddStoreCtrl'
        })
  }])