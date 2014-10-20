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

  prescription: [{ type: ObjectId, ref: 'Prescription' }],

  date: { type: Date, default: Date.now }
});

// Prescription
var prescriptionSchema = new Schema({
  _id: { type: ObjectId, auto: true },

  order: { type: ObjectId, ref: "Order" }, // referenced by order

  type: String, // png, gif, etc
  data: Buffer
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


/** Create Models out of Schemas
  */
var models = {
  User: db.model('User', userSchema),
  Store: db.model('Store', storeSchema),
  Order: db.model('Order', orderSchema),
  Prescription: db.model('Prescription', prescriptionSchema),
  SideEffect: db.model('SideEffect', sideEffectSchema)
}

/** REST API (using router)
  */
// TODO


/* Expose outside */
module.exports = {
  type: 'Mongo',
  router: router,
  models: models,
  connection: db
};