const express = require('express')
const authController = require('../Controllers/authController')
const commentController = require('../Controllers/commentController')
const Student = require('./../Models/Users/StudentModel')
const Comment = require('./../Models/Courses/CommentModel')

const router = express.Router({ mergeParams: true })

router
  .route('/')
  .post(commentController.setLectureCommentIds, commentController.createComment)

module.exports = router
