const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const factory = require('../Controllers/Handlers/handlerFactory')
const courseController = require('../Controllers/Courses/courseController')
const examController = require('../Controllers/Courses/examController')
const finalsRouter = require('./Secondary/finalsRouter')
const router = express.Router()

router.use('/:courseId/final', finalsRouter)

// #region Guest & Student
router.route('/').get(courseController.getCourses)
router.route('/guest/:id').get(courseController.getOneCourseGuests)
// #endregion

router.use(authController.protect)
router.get('/ids', courseController.getIds)
// #region Teacher
router.get(
  '/:id/teacher',
  authController.restrictTo('admin', 'teacher'),
  courseController.getOneCourseTeacher,
)
router.use(factory.setCourseIds)
router
  .route('/:courseId/mcq')
  .post(examController.createMcq)
  .get(examController.getAllMcqForCourse)
router
  .route('/:courseId/meq')
  .post(examController.createMeq)
  .get(examController.getAllMeqForCourse)
router.get('/:courseId/questions', examController.getAllQuestions)
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
