const reviewController = require('../Controllers/Reviews/reviewController')
const authController = require('../Controllers/Handlers/authController')
const Student = require('../Models/Users/StudentModel')
const express = require('express')
const router = express.Router()

router.use(authController.protect)
router.get('/ids', reviewController.ids)

// #region Student
router.post(
  '/',
  authController.restrictTo('student'),
  reviewController.createReview,
)
// #endregion
// #region Teacher
router.use(authController.restrictTo('teacher', 'admin'))
router.route('/').get(reviewController.getAllReviews)
router.route('/:id').get(reviewController.getOneReview)

// #endregion
// #region Admin
router
  .route('/:id')
  .delete(authController.restrictTo('admin'), reviewController.deleteReview)

// #endregion
module.exports = router
