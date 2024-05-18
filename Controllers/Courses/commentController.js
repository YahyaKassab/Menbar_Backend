const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Comment = require('../../Models/Courses/CommentModel')

exports.setLectureCommentIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.lecture) req.body.lecture = req.params.lectureId
  console.log('lecture: ', req.body.lecture)
  //   if (!req.body.user) req.body.user = req.user.id
  next()
}

exports.createComment = factory.createOne(Comment)
exports.getAllComments = factory.getAll(Comment)
exports.getOneComments = factory.getOne(Comment, { path: 'replay' })
exports.deleteComment = factory.deleteOne(Comment)
