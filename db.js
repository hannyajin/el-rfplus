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

/** Configure Schemas
  */
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// User
var userSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  name: {
    first: String,
    last: String
  },

  phone: String,
  email: String,

  allergies: [String],
  medical_conditions: [String],

  order_history: [ { type: ObjectId, ref: 'Order' } ],

  side_effects: [ { type: ObjectId, ref: 'SideEffect'} ]
});

// Store (Pharmacy)
var storeSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  name: String,
  address: String,
  phone: String,
  email: String,
  fax: String,

  logo: { type: ObjectId, ref: 'Image' },

  location: {
    lon: String,
    lat: String
  }
});

// Order
var orderSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  from: { type: ObjectId, ref: "User" },
  to: { type: ObjectId, ref: "Store" },

  prescription: [{ type: ObjectId, ref: 'Image' }],

  date: { type: Date, default: Date.now }
});

// SideEffect
var sideEffectSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  user: { type: ObjectId, ref: 'User' },

  date: { type: Date, default: Date.now },
  medications_taken: [String],
  side_effects: [String],
  severity: String, // low, med, hi
  notes: [String]
});

// Image
var imageShema = new Schema({
  _id: { type: ObjectId, auto: true },

  name: String,
  type: String,
  data: Buffer
});


/** Create Models out of Schemas
  */
var models = {
  User: db.model('User', userSchema),
  Store: db.model('Store', storeSchema),
  Order: db.model('Order', orderSchema),
  SideEffect: db.model('SideEffect', sideEffectSchema),
  "Image":  db.model('Image', imageShema)
}

/** REST API (using router)
  * Configure Routes
  */

function dblog(str) {
  console.log(str);
}

/* GET All Stores */
router.get('stores', function (req, res) {
  dblog('api: /stores');

  // get all stores
  models.Store.find({}, function (err, stores) {
    if (err) {
      dblog('api db err: ' + stores);
      return res.status(500).end();
    }

    dblog('api fetched: ');
    dblog(stores);

    res.json(stores);
  });
});

/* GET Store */
router.get('stores/:store', function (req, res) {
  var params = req.params;

  dblog('api: /stores');

  // get all stores
  models.Store.find({}, function (err, stores) {
    if (err) {
      dblog('api db err [finding stores]: ' + stores);
      return res.status(500).end();
    }

    dblog('api fetched: ');
    dblog(stores);

    res.json(stores);
  });
});

/* POST Insert a Store */
router.post('stores/', function (req, res) {
  var json = req.body;
  dblog('api new store: ' + json);

  // name, address, phone, email, fax, location, logo

  // make sure some essential information of the store is present
  if (!json || !json.name || !json.address || !json.email) {
    dblog('api err [stores/]: bad request (lacking store info)');
    return res.status(400).json({message: "Required Store fields not set."}).end();
  }

  // check that the store doesn't already exist
  models.Store.findOne(json, function (err, store) {
    if (err) {
      dblog('api db err [finding store]: ' + json);
      return res.status(500).end();
    }

    if (store) {
      // store already exists
      res.status(400);
      res.json({
        message: 'That store already exists. You should update the existing store.'
      });
      return res.end();
    } else {
      // store doesn't exist
      var store = new models.Store(json);

      store.save(function (err, store) {
        if (err) {
          dblog("api db err [stores/]: failed to save store");
          return res.status(500).end();
        }

        // store saved successfully
        return res.status(200).json(store).end();
      });
    }
  });
});

/* PUT update a store */
router.put('stores/', function (req, res) {
  var json = req.body;

  // make sure the store already exists
  models.Store.findOne(json, function (err, store) {
    if (err) {
      dblog('api db err [finding store]' + json);
      return res.status(500).end();
    }

    // name, address, phone, email, fax, location, logo
    if (store) {
      // store was found, make sure to update only valid fields
      store.name = json.name || store.name;
      store.address = json.address || json.address;
      store.phone = json.phone || json.phone;
      store.email = json.email || json.email;
      store.fax = json.fax || json.fax;
      store.location = json.location || json.location;
      store.logo = json.logo || json.logo;

      // save the updated store information
      store.save(function (err, store) {
        if (err) {
          dblog("api db err [stores/]: failed to update store");
          return res.status(500).end();
        }

        // store saved successfully
        return res.status(200).json(store).end();
      });
    } else {
      // no store to update
      dblog('api db err [no store to update]');
      return res.status(400).json({message: "No store found to update"}).end();
    }
  });
});

/* Expose outside */
module.exports = {
  type: 'Mongo',
  router: router,
  models: models,
  connection: db
};


/** Test
  */
/*
var user = new models.User({
  name: {
    first: "Fred",
    last: "Belly"
  },
  phone: "0401234567",
  email: "talmo.christian@gmail.com",

  allergies: ["bee strings", "sea food", "deadly bears"],
  medical_conditions: ["none"]
});

user.save(function (err, user) {
  if (err) {
    return console.log("User saving error: " + err);
  }

  console.log("user saved: " + user);
});
*/