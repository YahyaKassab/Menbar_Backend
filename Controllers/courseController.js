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
exports.getOneCourse = factory.getOne(Course)
exports.deleteCourse = factory.deleteOne(Course)
exports.updateCourse = factory.updateOne(Course)
<<<<<<< HEAD
=======

exports.getCoursesForGuest = catchAsync(async (req, res, next) => {
  const courses = await Course.find()
  // console.log(courses)
  const coursesForGuest = courses.map((course) => ({
    text: course.text,
    description: course.description,
  }))
  res.status(200).json({
    status: 'Success',
    results: coursesForGuest.length,
    data: { data: coursesForGuest },
  })
})
>>>>>>> origin/main
