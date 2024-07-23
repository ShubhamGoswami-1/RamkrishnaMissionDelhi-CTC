const Batch = require('./../models/batchModel');
const Course = require('../models/courseModel');
const Faculty = require('./../models/facultyModel');
const Student = require("./../models/studentModel");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.addNewBatch = catchAsync(async (req, res, next) => {
    const { facultyId, title, timing, startingDate, fees } = req.body;

    const courseId = req.params.courseId;
    
    const faculty = await Faculty.findOne({ _id: facultyId });
    const course = await Course.findOne({ _id: courseId });

    // Check if the facultyId is valid/existing 
    if(!faculty){
        return next(new AppError(`No faculty found with this id:${facultyId}`));
    }

    // Check if the facultyId is valid/existing 
    if(!course){
        return next(new AppError(`No course found with this id:${courseId}`))
    }

    const newBatch = await Batch.create({
        courseId,
        courseName: course.name,
        facultyId,
        facultyName: faculty.name,
        title,
        timing,
        startingDate,
        fees
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

    // res.redirect('/batch'); Al the redirect should be omitted
    
})

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
