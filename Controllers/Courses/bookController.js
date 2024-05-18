const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Course = require('../../Models/Courses/CourseModel')
const Book = require('../../Models/Courses/BookModel')

exports.createBook = factory.createOne(Book)

exports.getAllBooks = factory.getAll(Book, {
  path: 'course',
  select: 'text subject',
})
exports.getBook = factory.getOne(Book)

exports.updateBook = factory.updateOne(Book)
exports.deleteBook = factory.deleteOne(Book)

exports.getBookssForGuest = catchAsync(async (req, res, next) => {
  const books = await Book.find()
  // console.log(courses)
  const booksForGuest = books.map((book) => ({
    title: book.title,
    description: book.description,
  }))
  res.status(200).json({
    status: 'Success',
    results: books.length,
    data: { data: booksForGuest },
  })
})
exports.ids = factory.getIds(Book)
