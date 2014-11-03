var app = angular.module('rfpApp', []);

app.controller('AddStoreCtrl', ['$scope', '$http', 'storesFactory',
                function(scope, http, storesFactory) {

  scope.addStore = function() {
    console.log("adding store...");

    with (scope) {
      var data = {
        name: name,
        address: address,
        phone: phone,
        email: email,
        fax: fax,

        logo: {
          data: image_data
        },

        location: {
          lat: latitude,
          lon: longitude
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

    //http.post('http://localhost:3000/api/stores', data).
    http.post('/api/stores', data).
      success(function(addedStore, status, headers, config) {
        console.log("Success!");

        // TODO
        // add store section to list
        storesFactory.append(addedStore);
      }).
      error(function(data, status, headers, config) {
        console.log("Error!");
      });

  }; // addStore

  var nodragUploader = $('#upload_fallback')[0];

  var draggable = ('draggable' in document.createElement('span') && true);

  if (draggable) { // check if drag enabled
    var drag = $('#logo_drag_uploader');
    drag[0].ondragover = function () {
      console.log("dragstart");
      drag.addClass('logo_hover');
      return false;
    };

    drag[0].ondragleave = function () {
      console.log("dragleave");
      drag.removeClass('logo_hover');
      return false;
    };

    drag[0].ondrop = function (e) {
      e.preventDefault();
      console.log("dropped");
      drag.removeClass('logo_hover');
      readFiles(e.dataTransfer.files);
      return false;
    };

  } else { // draggable
    console.log("No drag support");
  }

  // logo file selector
  $('#upload_selector').onchange = function () {
    readFiles(this.files);
  }
  // logo url selector
  var _keyup_timer = null;
  var _keyup_delay = 300;
  $('#logo_url_sel')[0].onkeyup = function () {
    if (scope) {
      if (_keyup_timer) {
        window.clearTimeout(_keyup_timer);
      }
      var url = scope.logo_url + '';
      _keyup_timer = setTimeout(function() {
        previewFile(url)
      }, _keyup_delay);
    } else {
      console.log("error no scope");
    }
  }

  $('#logo_url_sel')[0].ondrop = function(e) {
    setTimeout(function() {
      previewFile(scope.logo_url + '');
    }, 200);
  }

  // read files
  function readFiles (files) {
    console.log("READ FILES");
    console.log(files);

    // preview the image (first only)
    var file = files[0];
    previewFile(file);

  }

  scope.image_data = null;

  function previewFile (file) {
    console.log("preview file: ");
    console.log(file);

    if (!file) {
      console.log("no file selected");
      return;
    }

    var p = $('#logo_preview')[0];

    if (typeof file === 'string' && file.indexOf('http://') === 0) {
      // treat as an URL
      p.src = file;

      // get image data from url
      http.get(file).
        success(function (imgdata, status, headers, config) {
          scope.image_data = imgdata;
        }).
        error(function () {
          console.log("Error reading img data from url");
        });

    } else {

      var reader = new FileReader();
      reader.onload = function (e) {
        p.src = e.target.result;
        scope.image_data = e.target.result;

      }
      reader.readAsDataURL(file);
    }

    // reset fields
    scope.logo_url = "";
  }

}]); // AddStoreCtrl


app.controller('StoreListCtrl', ['$scope', '$http', 'storesFactory',
                function(scope, http, storesFactory) {

  storesFactory.list(function (stores) {
    scope.stores = stores;
  });

  storesFactory.addListener(function (data) {
    scope.stores.push(data);
  })
}]); // StoreListCtrl



/** Factory
  */

app.factory('storesFactory', ['$http', function (http) {
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
}]);