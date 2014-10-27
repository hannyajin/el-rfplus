var app = angular.module('storeApp', []);

app.controller('AddStoreCtrl', ['$scope', '$http', '$q', function(scope, http, q) {

  scope.addStore = function() {
    console.log("adding store...");

    http.get(scope.logo_url).
      success(function (imgdata, status, headers, config) {

        console.log("imgdata: " + imgdata);

        with (scope) {
          var data = {
            name: name,
            address: address,
            phone: phone,
            email: email,
            fax: fax,

            logo: {
              data: imgdata
            },

            location: {
              lon: longitude,
              lat: latitude
            }
          }

          // reset form fields
          name = "";
          address = "";
          phone = "";
          email = "";
          fax = "";
          logo_url = "";
          longitude = "";
          latitude = "";
        }

        http.post('http://localhost:3000/api/stores', data).
          success(function() {
            console.log("Success!");
          }).
          error(function() {
            console.log("Error!");
          });
        
      }). // success
      error(function (data, status, headers, config) {
        console.log("Error in creating store.");
      }); // error

  };

}]);