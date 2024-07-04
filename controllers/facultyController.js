const Faculty = require('./../models/facultyModel');

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

exports.addNewFaculty = catchAsync(async (req, res, next) => {
    const { name, aadhaarNo, phone, email, address } = req.body;

    const newFaculty = await Faculty.create({
        name,
        aadhaarNo,
        phone,
        address,
        email
    });

    // res.status(201).json({
    //     status: "success",
    //     newFaculty
    // });

    res.redirect('/faculty');
})

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
        return next(new AppError(`No faculty found with id:${facultyId}`, 404));
    }

    res.status(200).json({
        status: "success",
        faculty
    })
})