const Course = require("../models/courseModel");

const catchAsync = require('../utils/catchAsync');

exports.addNewCourse = catchAsync(async (req, res, next) => {
    
    const { name, fees } = req.body;

    const newCourse = await Course.create({
        name,
        fees
    });

    res.status(201).json({
        status: "success",
        newCourse
    });
})