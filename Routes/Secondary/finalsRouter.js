const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const examController = require('../../Controllers/Courses/examController')
const answerController = require('../../Controllers/Courses/answerController')

const router = express.Router({ mergeParams: true })

router.use(authController.protect)
//params.courseId

// #region Student
router
  .route('/answers')
  .post(
    authController.restrictTo('student'),
    answerController.submitFinalAnswer,
  )
// #endregion

// #region Teacher
router.get(
  '/answers',
  authController.restrictTo('teacher', 'admin'),
  answerController.getAllFinalAnswers,
)
router.get(
  '/',
  authController.restrictTo('teacher', 'admin'),
  examController.getAllFinals,
)
router
  .route('/answers/:id')
  .get(
    authController.restrictTo('teacher', 'admin'),
    answerController.getFinalAnswer,
  )
  .patch(
    authController.restrictTo('teacher', 'admin'),
    answerController.markFinalAnswer,
  )

// #endregion

// #region Admin

router.use(authController.restrictTo('admin'))

router
  .route('/')
  .post(examController.createFinal)
  .patch(examController.updateFinal)
  .delete(examController.deleteFinal)

// #endregion

module.exports = router
