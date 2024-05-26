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
  '/',
  authController.restrictTo('teacher', 'admin'),
  examController.getAllFinals,
)
router.get(
  '/answers',
  authController.restrictTo('teacher', 'admin'),
  answerController.getAllFinalAnswers,
)
router
  .route('/answers/:id')
  .get(
    authController.restrictTo('teacher', 'admin'),
    answerController.getFinalAnswer,
  )
router.patch(
  '/answers/:id/mark',
  authController.restrictTo('teacher', 'admin'),
  answerController.markMeq,
)

// #endregion

// #region Admin

router.use(authController.restrictTo('admin'))

router.route('/').post(examController.createFinal)
router
  .route('/:id')
  .patch(examController.updateFinal)
  .delete(examController.deleteFinal)

// #endregion

module.exports = router
