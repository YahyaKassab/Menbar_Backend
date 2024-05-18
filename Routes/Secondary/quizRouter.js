const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const examController = require('../../Controllers/Courses/examController')
const answerController = require('../../Controllers/Courses/answerController')

const router = express.Router()

router
  .route('/')
  .post(examController.createQuiz)
  .get(examController.getAllQuizzes)
router.route('/answer').post(answerController.createQuizAnswer)
router
  .route('/mcq')
  .post(examController.createMcq)
  .get(examController.getAllMcq)
router
  .route('/meq')
  .post(examController.createMeq)
  .get(examController.getAllMeq)

module.exports = router
