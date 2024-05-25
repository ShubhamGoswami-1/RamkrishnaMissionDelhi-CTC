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

exports.getStudent = catchAsync(async (req, res, next) => {
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);

    if(!student){
        return next(new AppError(`No student found with id:${studentId}`, 404));
    }

    res.status(200).json({
        status: "sccess",
        student
    })
})

exports.getAllStudents = catchAsync(async (req, res, next) => {
    const students = await Student.find();

    res.status(200).json({
        status: "success",
        students
    });
})