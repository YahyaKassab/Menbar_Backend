const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Course = require('../Models/Courses/CourseModel')
const Book = require('../Models/Courses/BookModel')

exports.createBook = factory.createOne(Book)

exports.getAllBooks = factory.getAll(Book, {
  path: 'course',
  select: 'text subject',
})
exports.getBook = factory.getOne(Book)

exports.updateBook=factory.updateOne(Book)
exports.deleteBook=factory.deleteOne(Book)

