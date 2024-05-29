const reviewController = require('../Controllers/Reviews/reviewController')
const authController = require('../Controllers/Handlers/authController')
const studentController = require('../Controllers//Users/studentController')
const Student = require('../Models/Users/StudentModel')
const express = require('express')
const Teacher = require('../Models/Users/TeacherModel')
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
router.use(authController.protect(Teacher))
router
  .route('/')
  .get(
    authController.restrictTo('Teacher', 'Admin'),
    reviewController.getAllReviews,
  )
router
  .route('/:id')
  .get(
    authController.restrictTo('Teacher', 'Admin'),
    reviewController.getOneReview,
  )

// #endregion
// #region Admin
router
  .route('/:id')
  .delete(authController.restrictTo('Admin'), reviewController.deleteReview)

// #endregion
module.exports = router
