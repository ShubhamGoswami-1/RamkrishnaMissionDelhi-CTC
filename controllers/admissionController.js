const Admission = require('./../models/admissionModel');
const Student = require('./../models/studentModel');
const Course = require('./../models/courseModel');
const Batch = require('./../models/batchModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.newAdmission = catchAsync(async(req, res, next) => {
    const { studentId, courseId, batchId } = req.body; // formNo

    const student = await Student.findOne({ _id: studentId });
    const course = await Course.findById(courseId)
    const batch = await Batch.findOne({ _id: batchId });

    if(!student){
        return next(new AppError(`No student exists with this id:${studentId}`, 404));
    }

    if(!batch || !batch.active){
        return next(new AppError(`batch didnt existed or is inActive`, 404));
    }
    
    const newAdmission = await Admission.create({
        studentId,
        studentName : student.name,
        courseId,
        courseName: course.name,
        batchId,
        batchTitle: batch.title
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
});

exports.getAllAdmissions = catchAsync(async (req, res, next) => {
    const admissions = await Admission.find().sort({ DateOfAdmission: 1 });

    res.status(200).json({
        status: "success",
        admissions
    });
})

exports.searchAdmission = catchAsync(async (req, res, next) => {
    const { searchText, category } = req.query;
    const query = {};
    if(!category){
        category = studentName
    }
    if(searchText){
        query[category] = { $regex: new RegExp(searchText, "i") };   
    }
    let admissions = await Student.find(query)
    .sort({ [category]: 1})
    .limit(10);

    res.status(200).json({
        status: "success",
        admissions
    });
})