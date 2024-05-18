const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const examController = require('../../Controllers/Courses/examController')
const answerController = require('../../Controllers/Courses/answerController')

const router = express.Router({ mergeParams: true })
//params.lectureId
router.use(authController.protect)
// #region Student
router.post(
  '/answers/submit',
  authController.restrictTo('student'),
  answerController.submitQuiz,
)
router.get(
  '/',
  answerController.checkLectureOpen,
  examController.getQuizStudent,
)
// #endregion
router.use(authController.restrictTo('teacher', 'admin'))
// #region Teacher
router
  .route('/')
  .post(examController.createQuiz)
  .get(examController.getQuizTeacher)
  .patch(examController.updateQuiz)
  .delete(examController.deleteQuiz)
// #endregion
// #region Admin
router.delete('/answers', examController.deleteQuiz)
// #endregion
module.exports = router
