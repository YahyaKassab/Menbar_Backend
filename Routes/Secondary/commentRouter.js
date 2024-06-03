const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const commentController = require('../../Controllers/Courses/commentController')
const Student = require('../../Models/Users/StudentModel')
const Teacher = require('../../Models/Users/TeacherModel')
const Comment = require('../../Models/Courses/CommentModel')
const factory = require('../../Controllers/Handlers/handlerFactory')

const router = express.Router({ mergeParams: true })

// #region Student
router.patch('/like/:id', commentController.like)
router.patch('/dislike/:id', commentController.disLike)
router.route('/:id').get(commentController.getOneComment)
router
  .route('/')
  .post(
    factory.setLectureIds,
    authController.protect(Student),
    commentController.assignUserToBody,
    commentController.createComment,
  )
router.post(
  '/:id/reply',
  authController.protect(Student),
  commentController.assignUserToBody,
  commentController.addReply,
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

router.post(
  '/:id/teacher/reply',
  commentController.assignUserToBody,
  commentController.addReply,
)

router.get('/', commentController.getAllComments)
// #endregion

module.exports = router
