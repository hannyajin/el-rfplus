angular
  .module('rfpApp')
  .controller('navCtrl', ['$scope', '$filter', '$location', 
    function($scope, $filter, $location) {
    var tabs = ['Home', 'Stores', 'AddStore', 'Docs'];
    $scope.tabs = tabs;
    $scope.tabElements = [];


    angular.element(document).ready(function () {
      for (var i = 0; i < tabs.length; i++) {
        var id = ($filter('lowercase')(tabs[i]) ) + '-link';

         $scope.tabElements.push(document.getElementById(id));

        document.getElementById(id).addEventListener('click', function (e) {
          var te = $scope.tabElements;
          for (var i = 0; i < te.length; i++) {
            var e = te[i];
            if (this !== e)
              angular.element(e).removeClass('pure-menu-selected');
          }
          angular.element(this).addClass('pure-menu-selected');
        });
      }

      // set default selection based on url
      var e = document.getElementById($location.path().slice(1) + '-link');
      e = e ? e : $scope.tabElements[0];
      angular.element(e).addClass('pure-menu-selected');
    });
  }])