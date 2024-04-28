const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Course = require('../Models/Courses/CourseModel')

exports.createCourse = factory.createOne(Course)
exports.getAllCourses = factory.getAll(Course, [
  { path: 'book' },
  { path: 'teachers' },
])
exports.getIds = async (req, res) => {
  const allDocs = await Course.find({}, '_id')
  res.status(200).json({
    status: 'Success',
    results: allDocs.length,
    data: { data: allDocs },
  })
}
