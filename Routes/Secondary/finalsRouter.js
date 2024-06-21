const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const examController = require('../../Controllers/Courses/examController')
const answerController = require('../../Controllers/Courses/answerController')
const Student = require('../../Models/Users/StudentModel')
const Teacher = require('../../Models/Users/TeacherModel')

const router = express.Router({ mergeParams: true })

//params.courseId

// #region Student
router.get('/', authController.protect(Student), examController.getFinal)
router.post('/report-ai/:answerId', answerController.reportAi)
router
  .route('/answers')
  .post(
    authController.protect(Student),
    authController.restrictTo('Student'),
    answerController.submitFinalAnswer,
  )
// #endregion
router.use(authController.protect(Teacher))
// #region Teacher
router.get(
  '/teacher',
  authController.restrictTo('Teacher', 'Admin'),
  examController.getFinalTeacher,
)
router.get(
  '/all',
  authController.restrictTo('Teacher', 'Admin'),
  examController.getAllFinals,
)
router.get(
  '/answers',
  authController.restrictTo('Teacher', 'Admin'),
  answerController.getAllFinalAnswers,
)
router
  .route('/answers/:id')
  .get(
    authController.restrictTo('Teacher', 'Admin'),
    answerController.getFinalAnswer,
  )
router.patch(
  '/answers/:id/mark',
  authController.restrictTo('Teacher', 'Admin'),
  answerController.markMeq,
)

// #endregion

// #region Admin

router.use(authController.restrictTo('Admin'))

router.post(
  '/',
  (req, res, next) => {
    req.body.course = req.params.courseId
    next()
  },
  examController.createFinal,
)
router
  .route('/:id')
  .patch(examController.updateFinal)
  .delete(examController.deleteFinal)

// #endregion

module.exports = router
