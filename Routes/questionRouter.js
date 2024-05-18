const express = require('express')
const questionController = require('../Controllers/Reviews/questionController')
const authController = require('../Controllers/Handlers/authController')

const router = express.Router()
router.use(authController.protect)
router.get('/ids', questionController.ids)

// #region Student
router.post(
  '/ask',
  authController.restrictTo('student'),
  questionController.askQuestion,
)
router
  .route('/:id')
  .patch(questionController.updateQuestionAsker)
  .delete(questionController.deleteQuestionAsker)
// #endregion

// #region Teacher
router.use(authController.restrictTo('teacher', 'admin'))

router.get('/', questionController.getAllQuestions)
router.route('/:id').get(questionController.getOneQuestion)

router.delete('/:id/admin', questionController.deleteQuestion)

router.patch('/:id/answer', questionController.answerQuestion)
// #endregion

module.exports = router
