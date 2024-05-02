const express = require('express')
const authController = require('../Controllers/authController')
const courseController = require('../Controllers/courseController')

const router = express.Router()

router
  .route('/')
  .post(courseController.createCourse)
  .get(courseController.getAllCourses)

<<<<<<< HEAD
=======
router.route('/guest').get(courseController.getCoursesForGuest)

>>>>>>> origin/main
router.get('/ids', courseController.getIds)
router
  .get('/:id')
  .patch(courseController.updateCourse)
  .delete(courseController.deleteCourse)
  .get(courseController.getOneCourse)
module.exports = router
