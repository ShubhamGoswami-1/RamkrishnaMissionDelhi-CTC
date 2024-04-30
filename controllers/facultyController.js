const Faculty = require('./../models/facultyModel');

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.addNewFaculty = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    const newFaculty = await Faculty.create({
        name
    });

    res.status(201).json({
        status: "success",
        newFaculty
    });
})