const Admission = require('./../models/admissionModel');
const Student = require('./../models/studentModel');
const Batch = require('./../models/batchModel');

const catchAsyc = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.newAdmission = catchAsyc(async(req, res, next) => {
    const { studentId, courseId, batchId, formNo } = req.body;

    const student = await Student.findOne({ _id: studentId });
    const batch = await Batch.findOne({ _id: batchId });

    if(!student){
        return next(new AppError(`No student exists with this id:${studentId}`, 404));
    }

    if(!batch || !batch.active){
        return next(new AppError(`atch didnt existed or is inActive`, 404));
    }
    
    const newAdmission = await Admission.create({
        studentId,
        courseId,
        batchId,
        formNo
    });

    // Do neccessary steps
    // 1. Add the batch assigned to the student's batchIds array
    if(!student.batchIds){
        const batchIds = [];
        batchIds.push(batchId.toString());
        student.batchIds = batchIds;
    } else {
        student.batchIds.push(batchId);
    }

    // 2. Add the admission._id to the student course_admissionIds array
    if(!student.course_admissionIds){
        const course_admissionIds = [];
        course_admissionIds.push(newAdmission._id);
        student.course_admissionIds = course_admissionIds;
    } else {
        student.course_admissionIds.push(newAdmission._id);
    }

    await student.save();

    res.status(201).json({
        status: 'success',
        newAdmission
    })
})