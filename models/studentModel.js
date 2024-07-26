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
    // type: [String], 
    type: [
      {
        batchId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'batch'
        },
        discount: {
          type: Number,
          enum: [0, 15, 25, 50, 75],
          default: 0
        },
        feesWithGST: {
          type: Number,
          default: 0
        },        
        feesPaid: {
          type: Number,
          default: 0
        },
        feesDue: {
          type: Number,
          default: 0
        },
        paidAmtList: {
          type: [Number],
          default: []
        }
      }
    ]
  },
  course_admissionIds: {
    type: [String],
    default: []
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