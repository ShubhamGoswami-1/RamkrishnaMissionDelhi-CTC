const mongoose = require('mongoose');
const validator = require('validator');

const batchSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  courseName: {
    type: String
  },
  title: {
    type: String,
    default: '',
    required: [true, "Enter the name for the batch"]
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  facultyName: {
    type: String
  },
  timing: {
    type: String,
    required: [true, 'Need to enter the timing of the batch']
  },
  startingDate: {
    type: String
  },
  studentIds: {
    type: [String],
    default: ''
  },
  fees: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
    collection: "batch",
    versionKey: false,
    timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;