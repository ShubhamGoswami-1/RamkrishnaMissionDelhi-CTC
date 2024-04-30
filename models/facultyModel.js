const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter the name of the faculty"]
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