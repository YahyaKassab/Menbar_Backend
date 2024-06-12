const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Course = require('../../Models/Courses/CourseModel')
const Book = require('../../Models/Courses/BookModel')

exports.createBook = catchAsync(async (req, res, next) => {
  // Extract courseId from request parameters
  // const { courseId } = req.params
  // console.log('courseId', courseId)
  // req.body.course = courseId
  // console.log('body', req.body)
  // Create a new book using the request body
  const newBook = await Book.create(req.body)

  // Send success response
  res.status(201).json({
    status: 'success',
    data: {
      book: newBook,
    },
  })
})

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
