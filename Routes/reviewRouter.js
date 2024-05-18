const reviewController = require('../Controllers/Reviews/reviewController')
const authController = require('../Controllers/Handlers/authController')
const Student = require('../Models/Users/StudentModel')
const express = require('express')
const router = express.Router()

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview)

router.get('/ids', reviewController.ids)
router
  .route('/:id')
  .get(reviewController.getOneReview)
  .delete(reviewController.deleteReview)

module.exports = router
