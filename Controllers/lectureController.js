const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Lecture = require('../Models/Courses/LectureModel')

exports.createLecture = factory.createOne(Lecture)
exports.getAllLecture = factory.getAll(Lecture)
