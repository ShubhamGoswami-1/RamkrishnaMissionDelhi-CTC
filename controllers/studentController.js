const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
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
    const studentId = req.params.studentId;

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

    // Find the student by ID
    const student = await Student.findById(studentId);

    if (!student) {
        return next(new AppError(`Student not found with _id: ${studentId}`, 404));
    }

    // Update the student with the new details
    const updatedStudent = await Student.findByIdAndUpdate(studentId, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: "success",
        updatedStudent
    });
});

exports.downloadStudentsExcel = catchAsync(async (req, res, next) => {
    const students = await Student.find();

    if (!students.length) {
        return next(new AppError('No students found', 404));
    }

    const data = students.map(student => ({
        Name: student.name,
        Father_Name: student.fathersName,
        Email: student.email,
        AadhaarNo: student.aadhaarNo,
        Phone: student.phone,
        Address: student.address,
    }));

    const workSheet = xlsx.utils.json_to_sheet(data);
    const workBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workBook, workSheet, 'Students');

    // Use a valid temporary directory
    const dir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, 'students.xlsx');
    xlsx.writeFile(workBook, filePath);

    res.download(filePath, 'students.xlsx', (err) => {
        if (err) {
            return next(new AppError('Error downloading file', 500));
        }
        // Delete the file after download
        fs.unlinkSync(filePath);
    });
});