const express = require('express')
const authController = require('../Controllers/authController')
const studentController = require('../Controllers/studentController')
const Student = require('../Models/Users/StudentModel')

const router = express.Router()

router.post('/signup', authController.signUp(Student))
router.post('/login', authController.login(Student))
router
  .route('/')
  .get(authController.protect(Student), studentController.getAllStudents)

module.exports = router
