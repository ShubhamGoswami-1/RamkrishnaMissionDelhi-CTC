const Batch = require('./../models/batchModel');
const Course = require('../models/courseModel');
const Faculty = require('./../models/facultyModel');
const Student = require("./../models/studentModel");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.addNewBatch = catchAsync(async (req, res, next) => {
    const { facultyId, title, timing, startingDate, fees, GST } = req.body; // Include GST

    const courseId = req.params.courseId;
    
    const faculty = await Faculty.findOne({ _id: facultyId });
    const course = await Course.findOne({ _id: courseId });

    // Check if the facultyId is valid/existing 
    if(!faculty){
        return next(new AppError(`No faculty found with this id:${facultyId}`));
    }

    // Check if the courseId is valid/existing 
    if(!course){
        return next(new AppError(`No course found with this id:${courseId}`));
    }

    const newBatch = await Batch.create({
        courseId,
        courseName: course.name,
        facultyId,
        facultyName: faculty.name,
        title,
        timing,
        startingDate,
        fees,
        GST // Save GST value
    });

    if(!faculty.batchIds){
        const batchIds = [];
        batchIds.push(newBatch._id.toString());
        faculty.batchIds = batchIds;
    } else {
        faculty.batchIds.push(newBatch._id.toString());
    }

    await faculty.save();

    res.status(201).json({
        status: "success",
        newBatch
    });
});

exports.getAllBatches = catchAsync(async(req, res, next) => {
    const { studentId } = req.params;

    const batches = await Batch.find({
        studentIds: { $in: [studentId] }
    });

    res.status(200).json({
        status: "success",
        batches
    });
})

exports.getBatchesOfCourse = catchAsync(async (req, res, next) => {
    const courseId = req.params.courseId;

    const batches = await Batch.find({ courseId });

    res.status(200).json({
        status: "success",
        batches
    });
})

exports.searchBatch = catchAsync(async (req, res, next) => {
    const { searchText, category } = req.query;
    const query = {};
    if(!category){
        category = title
    }
    if(searchText){
        query[category] = { $regex: new RegExp(searchText, "i") };   
    }
    let batches = await Batch.find(query)
    .sort({ [category]: 1})
    .limit(10);

    res.status(200).json({
        status: "success",
        batches
    });
})

exports.getBatch = catchAsync(async (req, res, next) => {
    const batchId = req.params.batchId;

    const batch = await Batch.findById(batchId);

    if(!batch){
        return next(new AppError(`No batch found with id:${batchId}`, 404));
    }

    res.status(200).json({
        status: "success",
        batch
    })
}) 

exports.getBatchDetails = catchAsync( async (req, res, next) => {
    const { batchIds } = req.body;

    const batchDetails = await Promise.all(
      batchIds.map(async (batchId) => {
        const batch = await Batch.findById(batchId);
        if (!batch) return null;

        const students = await Student.find({ 'batchIds.batchId': batchId });

        const totalFeesPaid = students.reduce((total, student) => {
          const batchInfo = student.batchIds.find(batch => batch.batchId.toString() === batchId.toString());
          return total + (batchInfo ? batchInfo.feesPaid : 0);
        }, 0);

        return {
          ...batch._doc,
          totalFeesPaid
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        batchDetails: batchDetails.filter(batch => batch !== null)
      }
    });
});

exports.getBatchesByCourse = catchAsync(async (req, res, next) => {
    const { courseId } = req.params;

    // Find batches related to the given course ID
    const batches = await Batch.find({ courseId });

    // If no batches are found, return an error
    if (!batches.length) {
        return next(new AppError('No batches found for this course.', 404));
    }

    // Get batch details and calculate total fees paid by students in each batch
    const batchDetails = await Promise.all(
        batches.map(async (batch) => {
            const students = await Student.find({ 'batchIds.batchId': batch._id });

            const totalFeesPaid = students.reduce((total, student) => {
                const batchInfo = student.batchIds.find(b => b.batchId.toString() === batch._id.toString());
                return total + (batchInfo ? batchInfo.feesPaid : 0);
            }, 0);

            return {
                ...batch._doc,
                totalFeesPaid
            };
        })
    );

    res.status(200).json({
        status: 'success',
        data: {
            batchDetails
        }
    });
});

exports.getBatchStudents = catchAsync(async(req, res, next) => {
    const batchId = req.params.batchId;

    const batch = await Batch.findById(batchId);

    if(!batch){
        return  next(new AppError(`No batch found with _id:${batchId}`, 404));
    }

    // Find students whose IDs are in the batch's studentIds array
    const students = await Student.find({ _id: { $in: batch.studentIds } })
        .populate({
            path: 'course_admissionIds', // Assuming admissionIds is an array of ObjectId references to Admission model
            select: 'DateOfAdmission' // Select only the fields you need from Admission model
        });

    // Send the student data as a response
    res.status(200).json({
        status: 'success',
        results: students.length,
        data: { students }
    });
})