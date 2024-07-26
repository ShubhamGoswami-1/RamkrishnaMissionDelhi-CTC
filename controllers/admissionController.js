const Admission = require('./../models/admissionModel');
const Student = require('./../models/studentModel');
const Course = require('./../models/courseModel');
const Batch = require('./../models/batchModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.newAdmission = catchAsync(async(req, res, next) => {
    const { studentId, courseId, batchId, formNo, discount } = req.body; // formNo

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
        studentName: student.name,
        courseId,
        courseName: course.name,
        batchId,
        batchTitle: batch.title,
        formNo
    });

    // Do neccessary steps:

    // Apply discount if provided
    if(discount) {
        batch.fees = (batch.fees - (batch.fess * discount/100));
    }
    
    // Calculate feesWithGST
    const feesWithGST = batch.fees + (batch.fees * 0.18);

    // 1. Add the batch assigned to the student's batchIds array
    const batchEntry = {
        batchId: batchId,
        discount,
        feesWithGST: feesWithGST,
        feesPaid: 0,
        feesDue: feesWithGST,
        paidAmtList: []
    };

    if (!student.batchIds) {
        student.batchIds = [batchEntry];
    } else {
        student.batchIds.push(batchEntry);
    }

    // 2. Add the admission._id to the student course_admissionIds array
    if(!student.course_admissionIds){
        const course_admissionIds = [];
        course_admissionIds.push(newAdmission._id);
        student.course_admissionIds = course_admissionIds;
    } else {
        student.course_admissionIds.push(newAdmission._id);
    }

    // 3. Add the studentId to the batch's studentIds array
    if(!batch.studentIds){
        const studentIds = [];
        studentIds.push(student._id.toString());
        batch.studentIds = studentIds;
    } else {
        batch.studentIds.push(studentId.toString());
    }

    await student.save();
    await batch.save();

    res.status(201).json({
        status: 'success',
        newAdmission
    });
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
    
    // Use a default category if none is provided
    const searchCategory = category || 'studentName';

    if (searchText) {
        query[searchCategory] = { $regex: new RegExp(searchText, "i") };   
    }

    // Find admissions based on the query
    let admissions = await Admission.find(query)
        .sort({ DateOfAdmission: -1 }) // Sort by admission date, descending
        .limit(10); // Limit the number of results if needed

    res.status(200).json({
        status: "success",
        admissions
    });
});