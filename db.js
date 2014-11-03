var mongoose = require('mongoose');

var auth = require('./auth'); // get auth credentials

/** Connect to Mongo DataBase */
var mongo_opts = { keepalive: 1 };
var db = mongoose.createConnection(auth.mongo.url, mongo_opts);

// get objects for routing
var express = require('express');
var router = express.Router();

db.on('error', console.log.bind(console, 'db connection error:'));
db.once('open', function db_open() {
  console.log("Connected to DataBase");
});



/********************************************************
  * Configure Schemas (Database models)
  *******************************************************/
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


// Store (Pharmacy)
var storeSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  name: String, // GNT Pharma Inc
  address: String, // 871 Younge st. Toronto ON CA M4W4H2
  phone: String, // +9872213364
  fax: String, // +9872213648
  email: String,  // gnt.pharma@gmail.com

  logo: {
    href: String // url to logo
  },

  // gps coordinates (DDD) of store
  gps: {
    /* Example: 
     lat: 43.674043,
     lon: -79.388187
    */
    lat: String, // latitude
    lon: String // longitude
  },

  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

/* Orders
-----------------------*/

/* Call Doctor
----------------------------------------*/
var callDoctorSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  // User Information
  user: {
    name: {
      first: String,
      last: String
    },
    phone: String,
    email: String,

    allergies: [String], // optional
    medicalConditions: [String] // optional
  },

  // Doctor Information
  doctor: {
    name: {
      first: String,
      last: String
    },
    phone: String, // optional
    address: String, // optional
    city: String
  },

  // Prescriptions
  prescriptionNames: [String],

  // Send to Pharmacy
  store: { type: ObjectId, ref: "Store" },

  instructions: String, // optional
  date: { type: Date, default: Date.now }
});


/* Fill/Send/Refill My Prescription
----------------------------------------*/
var sendPrescriptionSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  // Photo of prescription
  prescription: {
    name: String, // optional
    type: String,
    data: Buffer, // img data as binary
    stringData: String // img data as string
  },

  // User Information
  user: {
    name: {
      first: String,
      last: String
    },
    phone: String,
    email: String,

    allergies: [String], // optional
    medicalConditions: [String] // optional
  },

  // Prescriptions
  prescriptionNames: [String],

  // Send to Pharmacy
  store: { type: ObjectId, ref: "Store" },

  instructions: String, // optional
  date: { type: Date, default: Date.now }
});


/* Request MedsCheck
----------------------*/
var requestMedsCheckSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  // User Information
  user: {
    name: {
      first: String,
      last: String
    },
    phone: String,
    email: String,

    allergies: [String], // optional
    medicalConditions: [String] // optional
  },

  // Possible times
  possibleTimes: [ Date ],

  // Send to Pharmacy
  store: { type: ObjectId, ref: "Store" },

  instructions: String, // optional
  date: { type: Date, default: Date.now }
});


/* Transfer Prescription
---------------------------------*/
var transferPrescriptionSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  // User Information
  user: {
    name: {
      first: String,
      last: String
    },
    phone: String,
    email: String,

    allergies: [String], // optional
    medicalConditions: [String] // optional
  },

  // Prescriptions
  prescriptionNames: [String],

  // Send to Pharmacy
  transfer: {
    from: { type: ObjectId, ref: "Store" },
    to: { type: ObjectId, ref: "Store" }
  },

  instructions: String, // optional
  date: { type: Date, default: Date.now }
});

/** Create Models out of Schemas
  */
var models = {
  Store: db.model('Store', storeSchema),
  CallDoctor: db.model('CallDoctor', callDoctorSchema),
  SendPrescription: db.model('SendPrescription', sendPrescriptionSchema),
  RequestMedsCheck: db.model('RequestMedsCheck', requestMedsCheckSchema),
  TransferPrescription: db.model('TransferPrescription', transferPrescriptionSchema)
  //User: db.model('User', userSchema),
  //SideEffect: db.model('SideEffect', sideEffectSchema),
  //"Image":  db.model('Image', imageShema)
}



/********************************************************
  * REST API (using router)
  * Configure Routes
  *******************************************************/

function dblog(str) {
  console.log(str);
}

/* Stores
#############################################*/

// GET /stores
// Stores Collection Resource
router.get('/stores', function (req, res) {
  dblog('api: GET /stores');
  //dblog("host: " + req.get('host') );

  // get all stores
  models.Store.find({}, function (err, stores) {
    if (err) {
      dblog('api db err: ' + stores);
      return res.status(500).json({

      }).end();
    }

    dblog('api: GET /stores OK,' + stores.length + " stores");
    res.status(200).json(stores).end();
  });
});

// GET /stores/:store
// GET Store Instance Resource
router.get('/stores/:storeId', function (req, res) {
  var params = req.params;

  dblog('api: GET /stores/:' + params.storeId);

  // get specific stores
  models.Store.findOne({_id: params.storeId}, function (err, store) {
    if (err) {
      dblog('api db err [finding stores]: ' + store);
      return res.status(500).end();
    }

    dblog('api: GET /stores/:' + params.storeId + ' OK');
    res.status(200).json(store).end();
  });
});


// PUT /stores 
// Full update/creation of store

// 201 Created, 200 OK
// Location: req.get('host') + url (header)
router.put('/stores', function (req, res) {
  var json = req.body;

  // make sure that all required fields are present
  var missingProperties = [];
  if (!json.name) {
    missingProperties.push('name');
  }

  if (!json.address) {
    missingProperties.push('address');
  }

  if (!json.phone) {
    missingProperties.push('phone');
  }

  if (!json.fax) {
    missingProperties.push('fax');
  }

  if (!json.email) {
    missingProperties.push('email');
  }

  if (!json.logo) {
    missingProperties.push('logo');
  }

  if (!json.gps) {
    missingProperties.push('gps');
  }

  if (missingProperties.length > 0) {
    dblog('api db err [PUT store]: 409 required fields missing')

    // 409 Conflict
    return res.status(409).json({
      'status': '409',
      'code': '40901',
      'properties': missingProperties, 
      'message': "Store can't be updated/created because required information is missing.",
      'developerMessage': "Store can't be updates/created because required information is\
       missing. The PUT method is an Idempotent operation. All properties must be defined.\
       partial updates are not possible with PUT (use POST for partial updates).",
      'moreinfo': req.get('host') + '/docs/errors/40901'
    }).end();
    //return res.status(409).json(errors[40901]).end();
  }

  // create or update the store
  models.Store.findOne(json, function (err, store) {
    if (err) {
      dblog('api db err: PUT /stores 500');
      return res.status(500).end();
    }

    var status = 200; // OK

    // name, address, phone, email, fax, location, logo
    if (!store) {
      store = new models.Store(json);
      status = 201; // created
    } else {
      // update fields of existing store
      store.name = json.name;
      store.address = json.address;
      store.phone = json.phone;
      store.email = json.email;
      store.fax = json.fax;
      store.gps = json.gps;
      store.logo = json.logo || json.logo;

      store.updatedAt = Date.now();
    } 

    var locationHeader = req.get('host') + '/api/v1/:' + store._id;

    // save the updated store information
    store.save(function (err, store) {
      if (err) {
        dblog("api db err: PUT /stores 500");
        return res.status(500).end();
      }

      // store saved successfully
      dblog('"api db: PUT /stores ' + status);
      return res.status(status).set('Location', locationHeader).json(store).end();
    }); // store save
  });
});



/* Orders
#############################################*/

// POST /orders/callDoctor
router.post('/orders/callDoctor', function (req, res) {
  var json = req.body;

  if (!json) {
    // 409 Conflict
    return res.status(400).json({
      'status': '400',
      'code': '40001',
      'property': 'Request Body', 
      'message': "Order can't be made because Request Body is missing.",
      'developerMessage': "Order (callDoctor) can't be made because Request Body is\
       missing from the POST Request.",
      'moreinfo': req.get('host') + '/docs/errors/40001'
    }).end();
  }

  // User Info
  if (!json.user) {
    // 409 Conflict
    return res.status(409).json({
      'status': '409',
      'code': '40902',
      'property': 'user', 
      'message': "Order can't be made because user information is missing.",
      'developerMessage': "Order can't be made because user information is missing.",
      'moreinfo': req.get('host') + '/docs/errors/40902'
    }).end();
  } else {

  }

  // Doctor Info
  if (!json.doctor) {
    // 409 Conflict
    return res.status(409).json({
      'status': '409',
      'code': '40903',
      'property': 'doctor', 
      'message': "Order can't be made because doctor information is missing.",
      'developerMessage': "Order can't be made because doctor information is missing.",
      'moreinfo': req.get('host') + '/docs/errors/40903'
    }).end();
  } else {
    
  }

  // PrescriptionNames
  if (!json.prescriptionNames) {
    // 409 Conflict
    return res.status(409).json({
      'status': '409',
      'code': '40904',
      'property': 'prescriptionNames', 
      'message': "Order can't be made because prescriptionNames is missing.",
      'developerMessage': "Order can't be made because prescriptionNames is missing.",
      'moreinfo': req.get('host') + '/docs/errors/40904'
    }).end();
  } else {
    
  }

  // To Store
  if (!json.store) {
    // 409 Conflict
    return res.status(409).json({
      'status': '409',
      'code': '40905',
      'property': 'store', 
      'message': "Order can't be made because store is missing.",
      'developerMessage': "Order can't be made because store is missing.",
      'moreinfo': req.get('host') + '/docs/errors/40905'
    }).end();
  } else {
    
    // get specific stores
    models.Store.findOne({_id: json.store}, function (err, store) {
      if (err) {
        dblog('api db err: POST /orders/callDoctor, ' + store);
        return res.status(500).end();
      }

      if (!store) { // no store found
        return res.status(409).json({
          'status': '409',
          'code': '40906',
          'property': 'store', 
          'message': "Order can't be made because a store with that id doesn't exist.",
          'developerMessage': "Order can't be made because a store with id: ["+ json.store +"]\
           doesn't exist.",
          'moreinfo': req.get('host') + '/docs/errors/40906'
        }).end();
      } else {
        // Order information is valid.
        var order = new models.CallDoctor(json);
        order.save(function (err, order) {
          if (err) {
            dblog('api db err: POST /orders/callDoctor');
            return res.status(500).end();
          }

          // TODO Process CallDoctor Order (send fax/email etc)
          // Simulate Processing Time for now during development
          // I.e, don't actually send faxes yet.
          setTimeout(function() {
            dblog('api: POST /orders/callDoctor OK');
            var href = req.get('host') + '/orders/' + order._id;
            return res.status(201).set('Location', href).json({
              'status': '201',
              'message': 'CallDoctor order successfully created.',
              'href': href
            }).end();
          }, 1000);
        });
      }
    });

  }

  // Instructions


});

// POST /orders/sendPrescription
router.post('/orders/sendPrescription', function (req, res) {
  var json = req.body;

  if (!json) {
    // 409 Conflict
    return res.status(400).json({
      'status': '400',
      'code': '40002',
      'property': 'Request Body', 
      'message': "Order can't be made because Request Body is missing.",
      'developerMessage': "Order (sendPrescription) can't be made because Request Body is\
       missing from the POST Request.",
      'moreinfo': req.get('host') + '/docs/errors/40002'
    }).end();
  }

  // TODO simulate work for now
  setTimeout(function() {
    return res.status(202).json({
      'status': '202',
      'code': '20200',
      'message': "Order accepted but has not and may not be processed. This API is still\
       under development.",
      'developerMessage': "Order accepted but has not and may not be processed.\
       This API is still under development.",
      'moreinfo': req.get('host') + '/docs/errors/20200'
    }).end();
  }, 1000);

  // Prescription Photo
  // User Info
  // PrescriptionNames
  // To Store
  // Instructions
});

// POST /orders/requestMedsCheck
router.post('/orders/requestMedsCheck', function (req, res) {
  var json = req.body;

  if (!json) {
    // 409 Conflict
    return res.status(400).json({
      'status': '400',
      'code': '40003',
      'property': 'Request Body', 
      'message': "Order can't be made because Request Body is missing.",
      'developerMessage': "Order (requestMedsCheck) can't be made because Request Body is\
       missing from the POST Request.",
      'moreinfo': req.get('host') + '/docs/errors/40003'
    }).end();
  }

  // TODO simulate work for now
  setTimeout(function() {
    return res.status(202).json({
      'status': '202',
      'code': '20200',
      'message': "Order accepted but has not and may not be processed. This API is still\
       under development.",
      'developerMessage': "Order accepted but has not and may not be processed.\
       This API is still under development.",
      'moreinfo': req.get('host') + '/docs/errors/20200'
    }).end();
  }, 1000);

  // User Info
  // Possible Times
  // To Store
  // Instructions
});

// POST /orders/transferPrescription
router.post('/orders/transferPrescription', function (req, res) {
  var json = req.body;

  if (!json) {
    // 409 Conflict
    return res.status(400).json({
      'status': '400',
      'code': '40004',
      'property': 'Request Body', 
      'message': "Order can't be made because Request Body is missing.",
      'developerMessage': "Order (transferPrescription) can't be made because Request Body is\
       missing from the POST Request.",
      'moreinfo': req.get('host') + '/docs/errors/40004'
    }).end();
  }

  // TODO simulate work for now
  setTimeout(function() {
    return res.status(202).json({
      'status': '202',
      'code': '20200',
      'message': "Order accepted but has not and may not be processed. This API is still\
       under development.",
      'developerMessage': "Order accepted but has not and may not be processed.\
       This API is still under development.",
      'moreinfo': req.get('host') + '/docs/errors/20200'
    }).end();
  }, 1000);
  
  // User Info
  // Possible Times
  // To Store
  // Instructions
});


// Development order grabber
router.get('/orders', function (req, res) {
  // forbidden
  return res.status(403).render('forbidden', {
    message: "Forbidden",
    error: {
      status: 403
    }
  }).end();
});


// General order grabber
router.get('/orders/:type/:id', function (req, res) {
  var params = req.params;

  // find one
  models[params.type].findOne({_id: params.id}, function (err, order) {
    if (err) {
      dblog('err GET /order/: ' + params.id + ": " +  err);
      return res.status(500).end();
    }

    if (!order) {
      dblog('GET /order/: ' + params.id + " not found.");
      return res.status(404).json({
      'status': '404',
      'code': '40401',
      'message': "An order with that id cannot be found.",
      'developerMessage': "An order with that id cannot be found.",
      'moreinfo': req.get('host') + '/docs/errors/40401'
      }).end();
    }

    dblog('GET /order/: ' + params.id + " OK.");
    return res.json(order).end();
  });
});


/* Expose outside */
module.exports = {
  type: 'Mongo',
  router: router,
  models: models,
  connection: db
};


