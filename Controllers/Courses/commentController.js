const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Comment = require('../../Models/Courses/CommentModel')

exports.createComment = factory.createOneExclude(Comment, [
  'replies',
  'totalScore',
  'createdAt',
])
exports.getOneComment = factory.getOne(Comment)
exports.deleteCommentAdmin = factory.deleteOne(Comment)
exports.updateComment = catchAsync(async (req, res, next) => {
  const id = req.params.id
  const body = factory.include(req.body, ['text'])
  const doc = await Comment.findOneAndUpdate(
    {
      _id: id, // Ensure that the comment ID matches
      student: req.student.id, // Ensure that the student matches
    },
    body, // Include other fields for update
    {
      new: true, // Return the updated doc, not the original one
      runValidators: true, // Will run validation on DB
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
  if (comment.student.id !== req.student.id) {
    return next(
      new AppError('You are not authorized to delete this comment', 403),
    )
  }

  await Comment.findByIdAndDelete(req.params.id)

  res.status(204).json({ status: 'success', data: null })
})

exports.addReply = catchAsync(async (req, res, next) => {
  req.body.lecture = req.params.lectureId
  const newReply = new Comment(req.body)
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
exports.assignUserToBody = (req, res, next) => {
  // Check if req.user is a student
  if (req.student) {
    // Assign req.user to req.body.student
    req.body.student = req.student._id
  }
  // Check if req.user is a teacher
  else if (req.teacher) {
    // Assign req.user to req.body.teacher
    req.body.teacher = req.teacher._id
  }
  console.log('body', req.body)
  // Continue to the next middleware
  next()
}
