const mongoose = require('mongoose');
const validator = require('validator');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  fathersName: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String, // Not Mandatory
  aadhaarNo: {
    type: String,
    minlength: 12,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'others'],
    required: ['true', "use smallcase values for male or female"]
  },
  dob: {
    type: String,
    required: [true, 'Please enter the DOB of student']
  },
  phone: {
    type: String
  },
  active: {
    type: Boolean,
    default: true,
  },
  address: {
    type: String,
    required: [true, "Enter the address"]
  },
  batchIds: {
    type: [String], 
    /* 
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Enter the courseId']
      },
      admissionDate: {
        type: Date,
        default: Date.now()
      },
      batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: [true, 'Enter the batchId']
      },
      formNo: {
        type: String,
        required: [true, "Need to fill the form number"]
      }
    }
    */
  },
  course_admissionIds: {
    type: [String]
  },
  education: {
    type: String
  },
  reference: {
    type: String
  }
}, {
    collection: "students",
    versionKey: false,
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;