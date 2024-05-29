const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const factory = require('../Controllers/Handlers/handlerFactory')
const courseController = require('../Controllers/Courses/courseController')
const examController = require('../Controllers/Courses/examController')
const finalsRouter = require('./Secondary/finalsRouter')
const lectureRouter = require('./lectureRouter')
const Teacher = require('../Models/Users/TeacherModel')
const router = express.Router()

router.use('/:courseId/final', finalsRouter)

// #region Guest & Student
router.route('/').get(courseController.getCourses)
router.route('/guest/:id').get(courseController.getOneCourseGuests)
// #endregion

router.use(authController.protect(Teacher))
router.get('/ids', courseController.getIds)
// #region Teacher
router.get(
  '/:id/teacher',
  authController.restrictTo('Admin', 'Teacher'),
  courseController.getOneCourseTeacher,
)
router.use(factory.setCourseIds)
router.get(
  '/mcq/:courseId',
  authController.restrictTo('Admin', 'Teacher'),
  examController.getAllMcqForCourse,
)
router.get(
  '/meq/:courseId',
  authController.restrictTo('Admin', 'Teacher'),
  examController.getAllMeqForCourse,
)
router.get(
  '/questions/:courseId',
  authController.restrictTo('Admin', 'Teacher'),
  examController.getAllQuestions,
)
// #endregion

router.use(authController.restrictTo('Admin'))

// #region Admin
router.route('/').post(courseController.createCourse)
router
  .route('/:id')
  .patch(courseController.updateCourse)
  .delete(courseController.deleteCourse)
// #endregion

module.exports = router
