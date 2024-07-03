const mongoose = require('mongoose');
const validator = require('validator');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Spanish", "French", "English", "Sanskrit", "Music"],
    required: [true, 'Please enter the class name!']
  },
  fees: {
    type: String,
    required: [true, "Enter the fees for the class"],
  }
}, {
    collection: "course",
    versionKey: false,
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;