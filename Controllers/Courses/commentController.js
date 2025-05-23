const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Comment = require('../../Models/Courses/CommentModel')

exports.createComment = catchAsync(async (req, res, next) => {
  const newDoc = await Comment.create(
    factory.exclude(req.body, ['replies', 'totalScore', 'createdAt']),
  )
  await newDoc.populate({ path: 'student', select: 'Fname Lname photo' })
  res.status(201).json({
    status: 'Success',
    data: newDoc,
  })
})

factory.createOneExclude(Comment, ['replies', 'totalScore', 'createdAt'])
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
    return next(new AppError('لم يوجد أو لا يسمح لك', 404))
  }

  res.status(200).json({
    status: 'Success',
    data: doc,
  })
})
exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id)

  if (!comment) {
    return next(new AppError('لا يوجد تعليق بهذا ال id', 404))
  }

  // Check if the student matches the user id
  if (comment.student.id !== req.student.id) {
    return next(new AppError('لا يمكنك مسح هذا الكومنت', 403))
  }

  await Comment.findByIdAndDelete(req.params.id)

  res.status(204).json({ status: 'success', data: null })
})

exports.addReply = catchAsync(async (req, res, next) => {
  // req.body.lecture = req.params.lectureId

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
  return res.status(200).json({
    status: 'success',
    data: {
      comment,
    },
  })
})
exports.getAllComments = factory.getAll(Comment)
exports.assignUserToBody = (req, res, next) => {
  if (req.student) req.body.student = req.student._id
  else if (req.teacher) req.body.teacher = req.teacher._id
  next()
}
exports.like = catchAsync(async (req, res, next) => {
  const id = req.params.id
  let userId = null

  if (req.student) {
    userId = req.student.id
  } else if (req.teacher) {
    userId = req.teacher.id
  }

  if (!userId) {
    return next(new AppError('لم نجد حسابك', 401))
  }

  try {
    const comment = await Comment.findById(id)

    if (!comment) {
      return next(new AppError('لا يوجد هذا التعليق', 404))
    }

    const isLiked = comment.likes.includes(userId)
    const update = isLiked
      ? { $pull: { likes: userId } }
      : {
          $addToSet: { likes: userId },
          $pull: { disLikes: userId }, // Ensure the user is not in dislikes
        }

    const updatedComment = await Comment.findByIdAndUpdate(id, update, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validation
    })

    res.status(200).json({
      status: 'success',
      data: updatedComment,
    })
  } catch (error) {
    return next(new AppError('مشكلة في الطلب', 500))
  }
})
exports.disLike = catchAsync(async (req, res, next) => {
  const id = req.params.id
  let userId = null

  if (req.student) {
    userId = req.student.id
  } else if (req.teacher) {
    userId = req.teacher.id
  }

  if (!userId) {
    return next(new AppError('لم نجد حسابك', 401))
  }

  try {
    const comment = await Comment.findById(id)

    if (!comment) {
      return next(new AppError('لا يوجد تعليق', 404))
    }

    const isDisliked = comment.disLikes.includes(userId)
    const update = isDisliked
      ? { $pull: { disLikes: userId } }
      : {
          $addToSet: { disLikes: userId },
          $pull: { likes: userId }, // Ensure the user is not in likes
        }

    const updatedComment = await Comment.findByIdAndUpdate(id, update, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validation
    })

    res.status(200).json({
      status: 'success',
      data: updatedComment,
    })
  } catch (error) {
    return next(new AppError('مشكلة في الطلب', 500))
  }
})
