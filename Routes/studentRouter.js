const express = require('express')
const authController = require('../Controllers/authController')
const studentController = require('../Controllers/studentController')
const Student = require('../Models/Users/StudentModel')

const router = express.Router()

router.post('/signup', authController.signUp(Student))
router.post('/login', authController.login(Student))
router.route('/').get(authController.protect, studentController.getAllStudents)
router
  .route('/:id')
  .get(studentController.getOneStudent)
  .patch(studentController.updateStudent)
  .delete(studentController.deleteStudent)

module.exports = router
