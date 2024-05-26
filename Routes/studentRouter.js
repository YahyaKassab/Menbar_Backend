const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const studentController = require('../Controllers/Users/studentController')
const Student = require('../Models/Users/StudentModel')

const router = express.Router()
// #region Guest
router.post('/signup', studentController.signUp)
router.post('/login', studentController.loginStudent)
router.post('/forgot-password', studentController.forgetPasswordStudent)
router.patch('/reset-password/:token', studentController.resetPasswordStudent)

// #endregion

router.use(authController.protect(Student))
router.get('/ids', studentController.ids)

// #region Student
router.get(
  '/me',
  authController.restrictTo('Student'),
  studentController.getMe,
  studentController.getOneStudent,
)
router.patch(
  '/update-me',
  authController.restrictTo('Student'),
  studentController.getMe,
  studentController.updateStudentByStudent,
)
router.patch(
  '/delete-me',
  authController.restrictTo('Student'),
  studentController.deleteMe,
)
router.get(
  '/:courseId/stats',
  studentController.getMe,
  studentController.getCourseStats,
)
// #endregion

// #region Teacher
router
  .route('/')
  .get(
    authController.restrictTo('Admin', 'Teacher'),
    studentController.getAllStudents,
  )
router
  .route('/:id')
  .get(
    authController.restrictTo('Admin', 'Teacher'),
    studentController.getOneStudent,
  )
  // #endregion

  //#region Admin
  .patch(authController.restrictTo('Admin'), studentController.updateStudent)
  .delete(authController.restrictTo('Admin'), studentController.deleteStudent)
// #endregion

module.exports = router
