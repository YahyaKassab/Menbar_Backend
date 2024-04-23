const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Student = require('../Models/Users/StudentModel')

exports.createStudent = factory.createOne(Student)
exports.getAllStudents = factory.getAll(Student)
