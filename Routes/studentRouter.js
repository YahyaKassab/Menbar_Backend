const express = require('express')
const authController = require('../Controllers/authController')
const studentController = require('../Controllers/studentController')
const Student = require('../Models/Users/StudentModel')

const router = express.Router()

router.post('/signup', authController.signUp(Student))
router.route('/').get(studentController.getAllStudents)

module.exports = router
