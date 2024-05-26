const reviewController = require('../Controllers/Reviews/reviewController')
const authController = require('../Controllers/Handlers/authController')
const studentController = require('../Controllers//Users/studentController')
const Student = require('../Models/Users/StudentModel')
const express = require('express')
const router = express.Router()

router.get('/ids', reviewController.ids)

// #region Student
router.post(
  '/',
  authController.protect(Student),
  authController.restrictTo('Student'),
  studentController.getMe,
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
