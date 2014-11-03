angular
  .module('rfpApp')
  .factory('storesFactory', ['$http', function (http) {
    var listeners = [];

    var cache = {};

    return {
      addListener: function(callback) {
        if (callback && typeof callback === "function") {
          listeners.push(callback);
        }
      },

      list: function (callback) {
        http.get('/api/v1/stores').success(callback)
      },
      append: function(data) {
        for (var i = 0; i < listeners.length; i++) {
          // call with new data
          var cb = listeners[i];
          if (cb) {
            cb(data);
          }
        }
      }
    }
  }])
  
  .controller('StoreListCtrl', ['$scope', '$http', 'storesFactory',
                function(scope, http, storesFactory) {

  storesFactory.list(function (stores) {
    scope.stores = stores;
  });

  storesFactory.addListener(function (data) {
    scope.stores.push(data);
  })
}]); // StoreListCtrl