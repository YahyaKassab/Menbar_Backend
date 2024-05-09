const mongose = require('mongoose')
const Reply = require('./../Models/Courses/replyModel')
const factory = require('./../Controllers/handlerFactory')

exports.setReplyCommentIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.comment) req.body.comment = req.params.commentId
  //console.log('lecture: ', req.body.lecture)
  next()
}
exports.createReplay = factory.createOne(Reply)
exports.getReplay = factory.getAll(Reply)
