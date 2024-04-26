const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Course = require('../Models/Courses/CourseModel')

exports.createCourse = factory.createOne(Course)
exports.getAllCourses = factory.getAll(Course, [
  { path: 'libraryItem' },
  { path: 'teachers' },
])
