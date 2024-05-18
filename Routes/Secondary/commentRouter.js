const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const commentController = require('../../Controllers/Courses/commentController')
const Student = require('../../Models/Users/StudentModel')
const Comment = require('../../Models/Courses/CommentModel')
const factory = require('../../Controllers/Handlers/handlerFactory')

const router = express.Router()

router.use(authController.protect, factory.setLectureIds)
// #region Student
router.route('/').post(commentController.createComment)
router
  .route('/:id')
  .patch(commentController.updateComment)
  .delete(commentController.deleteComment)
router.post('/:id/reply', commentController.addReply)

// #endregion

router.use(authController.restrictTo('teacher', 'admin'))
// #region Teacher
router
  .route('/:id')
  .get(commentController.getOneComment)
  .patch(commentController.updateComment)

router.get('/', commentController.getAllComments)
// #endregion
// #region Admin
router.delete('/:id', commentController.deleteCommentAdmin)
// #endregion

module.exports = router
