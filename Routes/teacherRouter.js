const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const teacherController = require('../Controllers/Users/teacherController')
const Teacher = require('../Models/Users/TeacherModel')
const upload = require('../multer')
const { uploadTeacherIMG } = require('../utils/cloudinaryMiddleware')

const router = express.Router()

//signup only posts
// #region Guest and Student
router.get('/', teacherController.getAllTeachersGuest)
router.post('/login', teacherController.loginTeacher)
router.post('/forgot-password', teacherController.forgetPasswordTeacher)
router.patch('/reset-password/:token', teacherController.resetPasswordTeacher)

router.get('/:id', teacherController.getTeacherGuest)
// #endregion
// router.use(authController.protect(Teacher), authController.restrictTo('Admin'))

router.get('/ids', teacherController.ids)
router.get(
  '/me',
  authController.protect(Teacher),
  authController.restrictTo('Teacher','Admin'),
  teacherController.getMe,
  teacherController.getTeacher,
)
router.patch(
  '/update-me',
  authController.protect(Teacher),
  authController.restrictTo('Teacher','Admin'),
  teacherController.getMe,
  upload.single('photo'),
  uploadTeacherIMG,
  teacherController.updateTeacherByTeacher,
)
router.patch(
  '/delete-me',
  authController.protect(Teacher),
  authController.restrictTo('Teacher'),
  teacherController.getMe,
  teacherController.deleteMe,
)
// #region Admin
router.get('/admin', teacherController.getAllTeachers)
router.post('/signup', teacherController.createTeacher)
router
  .route('/:id/admin')
  .patch(teacherController.updateTeacher)
  .delete(teacherController.deleteTeacher)
// #endregion

module.exports = router
