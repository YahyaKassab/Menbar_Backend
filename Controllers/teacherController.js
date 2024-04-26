const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Teacher = require('../Models/Users/TeacherModel')

exports.createTeacher = factory.createOne(Teacher)
exports.getAllTeachers = factory.getAll(Teacher)
