angular
  .module('rfpApp')
  .controller('homeCtrl', ['$scope', function($scope) {
    $scope.title = 'Home';
    $scope.items = ['item1', 'item2', 'item3'];
  }])