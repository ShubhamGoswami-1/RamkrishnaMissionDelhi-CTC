const mongoose = require('mongoose');
const validator = require('validator');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name of the faculty"]
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  aadhaarNo: {
    type: String,
    minlength: 12,
  },
  address: {
    type: String
  },
  phone: {
    type: String
  },
  batchIds: {
    type: [String],
    default: []
  }
}, {
    collection: "faculty",
    versionKey: false,
    timestamps: true
});

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;