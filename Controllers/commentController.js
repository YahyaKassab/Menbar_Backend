const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Comment = require('../Models/Courses/CommentModel')

exports.createComment = factory.createOne(Comment)
exports.getAllComments = factory.getAll(Comment)
exports.deleteComment = factory.deleteOne(Comment)
