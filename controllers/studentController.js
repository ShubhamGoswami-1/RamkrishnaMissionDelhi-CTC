const Student = require("./../models/studentModel");

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.addNewStudent = catchAsync(async (req, res, next) => {

    const { name, fathersName, email, aadhaarNo, gender, dob, address, education, reference } = req.body;

    const studentObj = {
        name,
        fathersName,
        email,
        aadhaarNo,
        gender,
        dob,
        address,
        education,
        reference
    };

    const newStudent = await Student.create(studentObj);

    res.status(201).json({
        status: "success",
        newStudent
    });
});