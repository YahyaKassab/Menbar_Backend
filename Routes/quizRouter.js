const express = require('express')
const authController = require('../Controllers/authController')
const examController = require('../Controllers/examController')
const answerController = require('../Controllers/answerController')

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
