const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Course = require('../../Models/Courses/CourseModel')

exports.createCourse = catchAsync(async (req, res, next) => {
  const newCourse = await Course.create(req.body)
  res.status(201).json({
    status: 'Success',
    data: newCourse,
  })
})
exports.getAllCourses = factory.getAll(Course)
exports.getIds = factory.getIds(Course)
exports.getOneCourseTeacher = factory.getOne(Course, [
  'book',
  'teachers',
  'prerequisites',
  'lectures',
  'students',
])
exports.deleteCourse = factory.deleteOne(Course)
exports.updateCourse = factory.updateOne(Course)

exports.getCourses = factory.getAllInclude(
  Course,
  ['book'],
  ['text', 'level', 'description', 'subject', 'book', '_id'],
)

exports.getOneCourseGuests = factory.getOneExclude(
  Course,
  ['book', 'teachers', 'prerequisites', 'lectures'],
  ['students'],
)
