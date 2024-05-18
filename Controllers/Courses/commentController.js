const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Comment = require('../../Models/Courses/CommentModel')

exports.createComment = factory.createOne(Comment, [
  'replies',
  'totalScore',
  'createdAt',
])
exports.getOneComment = factory.getOne(Comment)
exports.deleteCommentAdmin = factory.deleteOne(Comment)
exports.updateComment = catchAsync(async (req, res, next) => {
  const id = req.params.id
  const doc = await Comment.findByIdAndUpdate(
    id,
    {
      $and: [
        { _id: id }, // Ensure that the comment ID matches
        { student: req.body.student }, // Ensure that the student matches
      ],
      ...factory.include(req.body, ['text']), // Include other fields for update
    },
    {
      // Return the updated doc not the original one
      new: true,
      // Will run validation on DB
      // If set to false, the DB will accept anything
      runValidators: true,
    },
  )

  if (!doc) {
    return next(new AppError('No document found or No permission', 404))
  }

  res.status(200).json({
    status: 'Success',
    data: doc,
  })
})
exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    return next(new AppError('No comment found with that ID', 404))
  }

  // Check if the student matches the user id
  if (comment.student.toString() !== req.user.id) {
    return next(
      new AppError('You are not authorized to delete this comment', 403),
    )
  }

  await Comment.findByIdAndDelete(req.params.id)

  res.status(204).json({ status: 'success', data: null })
})

exports.addReply = catchAsync(async (req, res, next) => {
  const replyData = req.body.reply
  const newReply = new Comment(replyData)
  await newReply.save()

  const comment = await Comment.findByIdAndUpdate(
    req.params.id,
    { $push: { replies: newReply._id } },
    { new: true },
  ).populate('replies')

  if (!comment) {
    return next(new Error('Comment not found'))
  }

  // Return the updated comment
  res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  })
})
exports.getAllComments = factory.getAll(Comment)
