const express = require('express')
const questionController = require('../Controllers/Reviews/questionController')
const authController = require('../Controllers/Handlers/authController')
const studentController = require('../Controllers/Users/studentController')
const Student = require('../Models/Users/StudentModel')

const router = express.Router()
router.get('/ids', questionController.ids)

// #region Student
router.post(
  '/ask',
  authController.protect(Student),
  authController.restrictTo('Student'),
  studentController.setStudentId,
  questionController.askQuestion,
)
router
  .route('/:id')
  .patch(
    authController.protect(Student),
    authController.restrictTo('Student'),
    questionController.updateQuestionAsker,
  )
  .delete(
    authController.protect(Student),
    authController.restrictTo('Student'),
    questionController.deleteQuestionAsker,
  )
// #endregion

// #region Teacher
router.use(authController.restrictTo('teacher', 'admin'))

router.get('/', questionController.getAllQuestions)
router.route('/:id').get(questionController.getOneQuestion)

router.delete('/:id/admin', questionController.deleteQuestion)

router.patch('/:id/answer', questionController.answerQuestion)
// #endregion

module.exports = router
