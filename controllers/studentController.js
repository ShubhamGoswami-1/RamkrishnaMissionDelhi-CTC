const Student = require("./../models/studentModel");
const Batch = require("./../models/batchModel");

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.addNewStudent = catchAsync(async (req, res, next) => {

    const { name, fathersName, email, aadhaarNo, gender, phone, dob, address, education, reference } = req.body;

    const studentObj = {
        name,
        fathersName,
        email,
        aadhaarNo,
        gender,
        phone,
        dob,
        address,
        education,
        reference
    };

    const newStudent = await Student.create(studentObj);

    // res.status(201).json({
    //     status: "success",
    //     newStudent
    // });

    res.redirect('/students');
});

exports.getStudent = catchAsync(async (req, res, next) => {
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);

    if(!student){
        return next(new AppError(`No student found with id:${studentId}`, 404));
    }

    console.log("Student: ", student)

    res.status(200).json({
        status: "success",
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

exports.searchStudent = catchAsync(async (req, res, next) => {
    const { searchText, category } = req.query;
    const query = {};
    if(!category){
        category = name
    }
    if(searchText){
        query[category] = { $regex: new RegExp(searchText, "i") };   
    }
    let students = await Student.find(query, {
        _id: 1,
        name: 1,
        fathersName: 1,
        aadhaarNo: 1,
        phone: 1,
        address: 1,
        email: 1
    })
    .sort({ [category]: 1})
    .limit(10);

    res.status(200).json({
        status: "success",
        students
    });
})

exports.getStudentBatches = catchAsync(async (req, res, next) => {
    const studentId = req.body.studentId;

    const student = await Student.findById(studentId);

    if(!student){
        return next(new AppError(`No student found with _id:${studentId}`), 404);
    }

    const batches = await Batch.find({ _id: { $in: student.batchIds }});

    res.status(200).json({
        status: "success",
        batches
    });
});

exports.editStudentDetails = catchAsync(async (req, res, next) => {
    const studentId = req.params.studentId;

    const student = await Student.findById(studentId);

    if(!student){
        return next(new AppError(`student not found with _id:${studentId}`, 404));
    }

    const updatedObj = {...req.body};

    const updatedStudent = await student.updateOne({ updatedObj }, { new: true });

    res.status(200).json({
        status: "success",
        updatedStudent
    });
});