const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Course = require('../../Models/Courses/CourseModel')

const fs = require('fs')
const PDFDocument = require('pdfkit')
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

exports.createCertificate = catchAsync(async (req, res, next) => {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
  })
  const name = 'nigga'
  //pipe pdf file into a name.pdf
  doc.pipe(fs.createWriteStream(`${name}.pdf`))

  //draw image
  doc.image('certificate.png', 0, 0, { width: 842 })

  //set font
  doc.font('Courier')

  //draw the name
  doc.fontSize(30).text(name, 20, 265, {
    align: 'center',
  })
})
