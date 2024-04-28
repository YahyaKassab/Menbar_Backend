const express = require('express')
const authController = require('../Controllers/authController')
const courseController = require('../Controllers/courseController')

const router = express.Router()

router
  .route('/')
  .post(courseController.createCourse)
  .get(courseController.getAllCourses)

router.get('/ids', courseController.getIds)

module.exports = router
