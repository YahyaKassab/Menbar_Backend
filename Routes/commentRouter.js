const express = require('express')
const authController = require('../Controllers/authController')
const commentController = require('../Controllers/commentController')
const Student = require('./../Models/Users/StudentModel')
const Comment = require('./../Models/Courses/CommentModel')

const replyRouter = require('./replyRoutes')
const router = express.Router({ mergeParams: true })

router.use('/:commentId/reply', replyRouter)

router
  .route('/')
  .post(commentController.setLectureCommentIds, commentController.createComment)
  .get(commentController.getAllComments)

router.route('/:id').get(commentController.getOneComments)

module.exports = router
