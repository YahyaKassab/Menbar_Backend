const express = require('express')
const answerController = require('../Controllers/answerController')

const router = express.Router()

router
  .route('/mcq')
  .get(answerController.getAllMcqAnswers)
  .post(answerController.createMcqAnswer)
router
  .route('/meq')
  .get(answerController.getAllMeqAnswers)
  .post(answerController.createMeqAnswer)

module.exports = router
