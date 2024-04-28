const express = require('express')
const authController = require('../Controllers/authController')
const examController = require('../Controllers/examController')

const router = express.Router()

router.route('/').post(examController.createQuiz)
router
  .route('/mcq')
  .post(examController.createMcq)
  .get(examController.getAllMcq)
router
  .route('/meq')
  .post(examController.createMeq)
  .get(examController.getAllMeq)

module.exports = router
