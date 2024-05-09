const express = require('express')
const authController = require('../Controllers/authController')
const commentController = require('../Controllers/commentController')
const Student = require('./../Models/Users/StudentModel')
<<<<<<< HEAD
const Comment = require('./../Models/Courses/CommentModel')
<<<<<<< HEAD
=======
>>>>>>> abdo

=======
const replyRouter = require('./replyRoutes')
const { Mongoose } = require('mongoose')
>>>>>>> origin/abdo
const router = express.Router({ mergeParams: true })

router.use('/:commentId/reply', replyRouter)

router
  .route('/')
  .post(commentController.setLectureCommentIds, commentController.createComment)
  .get(commentController.getAllComments)

router.route('/:id').get(commentController.getOneComments)

module.exports = router
