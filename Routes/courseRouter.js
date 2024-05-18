const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const courseController = require('../Controllers/Courses/courseController')
const finalsRouter = require('./Secondary/finalsRouter')
const router = express.Router({ mergeParams: true })

router.use('/:courseId/final', finalsRouter)

// #region Guest & Student
router.route('/').get(courseController.getCourses)
router.route('/:id').get(courseController.getOneCourseGuests)
// #endregion

router.use(authController.protect)
router.get('/ids', courseController.getIds)
// #region Teacher
router.get(
  '/:id/teacher',
  authController.restrictTo('admin', 'teacher'),
  courseController.getOneCourseTeacher,
)
// #endregion

router.use(authController.restrictTo('admin'))

// #region Admin
router.route('/').post(courseController.createCourse)
router
  .route('/:id')
  .patch(courseController.updateCourse)
  .delete(courseController.deleteCourse)
// #endregion

module.exports = router
