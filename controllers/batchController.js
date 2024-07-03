const Batch = require('./../models/batchModel');
const Course = require('../models/courseModel');
const Faculty = require('./../models/facultyModel');

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.addNewBatch = catchAsync(async (req, res, next) => {
    const { courseId, facultyId, title, timing, startingDate } = req.body;

    const faculty = await Faculty.findOne({ _id: facultyId });
    const course = await Course.findOne({ _id: courseId });

    // Check if the facultyId is valid/existing 
    if(!faculty){
        return next(new AppError(`No faculty found with this id:${facultyId}`));
    }

    // Check if the facultyId is valid/existing 
    if(!course){
        return next(new AppError(`No class found with this id:${courseId}`))
    }

    const newBatch = await Batch.create({
        courseId,
        courseName: course.name,
        facultyId,
        facultyName: faculty.name,
        title,
        timing,
        startingDate
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
})

exports.getAllBatches = catchAsync(async(req, res, next) => {
    const { courseId } = req.query;

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