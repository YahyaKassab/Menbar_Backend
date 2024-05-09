const reviewController = require('./../Controllers/reviewController')
const authController = require('./../Controllers/authController')
const Student = require('./../Models/Users/StudentModel')
const express = require('express')
const router = express.Router()

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview)
router
  .route('/:id')
  .get(reviewController.getOneReview)
  .delete(reviewController.deleteReview)

module.exports = router
