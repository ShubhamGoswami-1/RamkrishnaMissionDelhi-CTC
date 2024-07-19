const Course = require("../models/courseModel");

const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');

exports.addNewCourse = catchAsync(async (req, res, next) => {
    
    const { name, fees } = req.body;

    const newCourse = await Course.create({
        name,
        fees
    });

    // have to handle redirection in JS in order to bring back res.status
    // res.status(201).json({
    //     status: "success",
    //     newCourse
    // });

    res.redirect('/course');
})

exports.getAllCourses = catchAsync(async (req, res, next) => {
    const courses = await Course.find();

    res.status(200).json({
        status: "success",
        courses
    });
})

exports.searchCourse = catchAsync(async (req, res, next) => {
    const { searchText } = req.query;
    let query = {};

    if(searchText){
        query.name = { $regex: new RegExp(searchText, "i") };   
    }

    const courses = await Course.find(query).sort({ name : 1});

    res.status(200).json({
        status: "success",
        courses
    });
})

exports.getCourseFees = catchAsync(async (req, res, next) => {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId).select('fees');

    if(!course){
        return next(new AppError('No course found with this id', 404));
    }

    res.status(200).json({
        status: "success",
        fees: +course.fees
    });
})