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

        //http.post('http://localhost:3000/api/stores', data).
        http.post('/api/stores', data).
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
  nodragUploader.querySelector('input').onchange = function () {
    readFiles(this.files);
  }
  // logo url selector
  $('#logo_url_sel')[0].onkeyup = function () {
    //var p = $('#logo_preview')[0];
    //p.src = scope.logo_url;

    previewFile(scope.logo_url);
  }

  // read files
  function readFiles (files) {
    console.log("READ FILES");
    console.log(files);

    // preview the image (first only)
    var file = files[0];
    previewFile(file);

  }

  function previewFile (file) {
    var p = $('#logo_preview')[0];

    if (file.indexOf('http://') === 0) {
      // treat as an URL
      p.src = scope.logo_url;
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      p.src = e.target.result;
    }
    reader.readAsDataURL(file);
  }

}]); // AddStoreCtrl