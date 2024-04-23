const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Comment = require('../Models/Courses/CommentModel')

exports.createComment = factory.createOne(Comment)
// exports.getlibraryItem = factory.getOne(LibraryItem, { path: 'book' })
// exports.getAllLibraryItems = factory.getAll(LibraryItem)
// exports.createBook = factory.createOne(Book)

// exports.getAllBooks = factory.getAll(Book)
// exports.getBook = factory.getOne(Book)
