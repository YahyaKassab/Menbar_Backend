const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const commentController = require('../../Controllers/Courses/commentController')
const Student = require('../../Models/Users/StudentModel')
const Comment = require('../../Models/Courses/CommentModel')

const router = express.Router()

router
  .route('/')
  .post(commentController.setLectureCommentIds, commentController.createComment)
  .get(commentController.getAllComments)

router.route('/:id').get(commentController.getOneComments)

module.exports = router
