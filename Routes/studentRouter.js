const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const studentController = require('../Controllers/Users/studentController')
const Student = require('../Models/Users/StudentModel')
const Teacher = require('../Models/Users/TeacherModel')
const upload = require('../multer')
const { uploadStudentIMG } = require('../utils/cloudinaryMiddleware')

const router = express.Router()
// #region Guest
router.post('/signup', studentController.signUp)
router.post('/login', studentController.loginStudent)
router.post('/forgot-password', studentController.forgetPasswordStudent)
router.get('/reset-password/:token', studentController.resetPasswordStudent)
router.get('/confirmEmail/:token', authController.confirmEmail)

// #endregion

router.get('/ids', studentController.ids)

// #region Student
router.get(
  '/me',
  authController.protect(Student),
  authController.restrictTo('Student'),
  studentController.getMe,

  studentController.getOneStudent,
)
router.patch(
  '/update-me',
  authController.protect(Student),
  authController.restrictTo('Student'),
  studentController.getMe,
  upload.single('photo'),
  uploadStudentIMG,
  studentController.updateStudentByStudent,
)
router.patch(
  '/delete-me',
  authController.protect(Student),
  authController.restrictTo('Student'),
  studentController.getMe,
  studentController.deleteMe,
)
router
  .route('/')
  .get(
    authController.protect(Teacher),
    authController.restrictTo('Admin', 'Teacher'),
    studentController.getAllStudents,
  )
router.get(
  '/:courseId/stats',
  authController.protect(Student),
  studentController.getMe,
  studentController.getCourseStats,
)
router.get(
  '/courses-stats',
  authController.protect(Student),
  studentController.getMe,
  studentController.getAllCoursesStats,
)
// #endregion

// #region Teacher
router
  .route('/:id')
  .get(
    authController.protect(Teacher),
    authController.restrictTo('Admin', 'Teacher'),
    studentController.getOneStudent,
  )
  // #endregion

  //#region Admin
  .patch(authController.restrictTo('Admin'), studentController.updateStudent)
  .delete(authController.restrictTo('Admin'), studentController.deleteStudent)
// #endregion

module.exports = router
