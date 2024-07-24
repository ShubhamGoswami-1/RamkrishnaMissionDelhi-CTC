const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const Faculty = require('./../models/facultyModel');

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.addNewFaculty = async (req, res, next) => {
    try {
        const { name, aadhaarNo, phone, email, address } = req.body;

        // Create new faculty
        const newFaculty = await Faculty.create({
            name,
            aadhaarNo,
            phone,
            email,
            address
        });

        res.status(201).json({
            status: 'success',
            newFaculty
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}


exports.getAllFaculties = catchAsync(async (req, res, next) => {
    const faculties = await Faculty.find();

    res.status(200).json({
        status: "success",
        faculties
    });
})

exports.searchFaulty = catchAsync(async (req, res, next) => {
    const { searchText, category } = req.query;
    const query = {};
    if(!category){
        category = name
    }
    if(searchText){
        query[category] = { $regex: new RegExp(searchText, "i") };   
    }
    let faculties = await Faculty.find(query, {
        _id: 1,
        name: 1,
        email: 1,
        aadhaarNo: 1,
        phone: 1,
        address: 1
    })
    .sort({ [category]: 1})
    .limit(10);

    res.status(200).json({
        status: "success",
        faculties
    });
})

exports.getFaculty = catchAsync(async (req, res, next) => {

    const facultyId = req.params.facultyId;

    const faculty = await Faculty.findById(facultyId);

    if(!faculty){
        console.log("facultyId is  :", facultyId);
        return next(new AppError(`No faculty found with id:${facultyId}`, 404));
    }

    console.log("facultyId is  :", facultyId);
    res.status(200).json({
        status: "success",
        faculty
    })
})


exports.editFacultyDetails = catchAsync(async (req, res, next) => {
    const facultyId = req.params.facultyId;

    // Find the faculty by ID
    const faculty = await Faculty.findById(facultyId);

    if (!faculty) {
        return next(new AppError(`Faculty not found with _id: ${facultyId}`, 404));
    }

    const updatedObj = { ...req.body };

    // Update the faculty details
    const updatedFaculty = await Faculty.findByIdAndUpdate(facultyId, updatedObj, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        updatedFaculty
    });
});

exports.downloadFacultyExcel = catchAsync(async (req, res, next) => {
    const faculties = await Faculty.find();

    if (!faculties.length) {
        return next(new AppError('No students found', 404));
    }

    const data = faculties.map(faculty => ({
        Name: faculty.name,
        AadhaarNo: faculty.aadhaarNo,
        Phone: faculty.phone,
        Address: faculty.address,
        Email: faculty.email,
    }));

    const workSheet = xlsx.utils.json_to_sheet(data);
    const workBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workBook, workSheet, 'Faculty');

    // Use a valid temporary directory
    const dir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, 'faculty.xlsx');
    xlsx.writeFile(workBook, filePath);

    res.download(filePath, 'faculty.xlsx', (err) => {
        if (err) {
            return next(new AppError('Error downloading file', 500));
        }
        // Delete the file after download
        fs.unlinkSync(filePath);
    });
});