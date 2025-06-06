const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const commentController = require('../../Controllers/Courses/commentController')
const Student = require('../../Models/Users/StudentModel')
const Teacher = require('../../Models/Users/TeacherModel')
const Comment = require('../../Models/Courses/CommentModel')
const factory = require('../../Controllers/Handlers/handlerFactory')

const router = express.Router({ mergeParams: true })

// #region Student
router.patch(
  '/like/:id',
  authController.protect(Student),
  commentController.like,
)
router.patch(
  '/dislike/:id',
  authController.protect(Student),
  commentController.disLike,
)
router.route('/:id').get(commentController.getOneComment)
router.post(
  '/:id/reply',
  authController.protect(Student),
  commentController.assignUserToBody,
  commentController.addReply,
)
router
  .route('/')
  .post(
    factory.setLectureIds,
    authController.protect(Student),
    commentController.assignUserToBody,
    commentController.createComment,
  )

router
  .route('/:id')
  .patch(authController.protect(Student), commentController.updateComment)
  .delete(authController.protect(Student), commentController.deleteComment)

// #endregion

router.use(
  authController.protect(Teacher),
  authController.restrictTo('Teacher', 'Admin'),
)
// #region Admin
router.delete('/:id', commentController.deleteCommentAdmin)
// #endregion
// #region Teacher
router.post(
  '/teacher',
  factory.setLectureIds,
  commentController.assignUserToBody,
  commentController.createComment,
)

router.patch(
  '/likeTeacher/:id',
  authController.protect(Teacher),
  commentController.like,
)
router.patch(
  '/dislikeTeacher/:id',
  authController.protect(Teacher),
  commentController.disLike,
)

router.post(
  '/:id/teacher/reply',
  commentController.assignUserToBody,
  commentController.addReply,
)

router.get('/', commentController.getAllComments)
// #endregion

module.exports = router
