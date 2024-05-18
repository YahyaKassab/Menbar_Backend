const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const teacherController = require('../Controllers/Users/teacherController')
const Teacher = require('../Models/Users/TeacherModel')

const router = express.Router()

//signup only posts
// #region Guest
router.get('/guest', teacherController.getTeacherGuest)
router.get('/:id/guest', teacherController.getAllTeachersGuest)
// #endregion

router.get('/ids', teacherController.ids)
router.get('/', teacherController.getAllTeachers)
router.post('/signup', authController.signUp(Teacher))

router.route('/:teacherId/guest')
module.exports = router
