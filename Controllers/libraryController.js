const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Course = require('../Models/Courses/CourseModel')
const LibraryItem = require('../Models/Courses/LibraryItemModel')
const Book = require('../Models/Courses/BookModel')

exports.createLibraryItem = factory.createOne(LibraryItem)
exports.getlibraryItem = factory.getOne(LibraryItem, { path: 'book' })
exports.getAllLibraryItems = factory.getAll(LibraryItem)
exports.createBook = factory.createOne(Book)

exports.getAllBooks = factory.getAll(Book)
exports.getBook = factory.getOne(Book)
