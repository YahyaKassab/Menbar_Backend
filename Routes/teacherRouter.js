const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const teacherController = require('../Controllers/Users/teacherController')
const Teacher = require('../Models/Users/TeacherModel')

const router = express.Router()

//signup only posts
// #region Guest and Student
router.get('/', teacherController.getAllTeachersGuest)
router.get('/:id', teacherController.getTeacherGuest)
// #endregion
router.use(authController.protect, authController.restrictTo('Admin'))

router.get('/ids', teacherController.ids)

// #region Admin
router.get('/admin', teacherController.getAllTeachers)
router.post('/signup', authController.signUp(Teacher))
router
  .route('/:id/admin')
  .patch(teacherController.updateTeacher)
  .delete(teacherController.deleteTeacher)
// #endregion

module.exports = router
