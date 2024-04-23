const express = require('express')
const authController = require('../Controllers/authController')
const examController = require('../Controllers/examController')

const router = express.Router()

router.route('/').post(examController.createQuiz)
router
  .route('/mcq')
  .post(examController.createMcq)
  .get(examController.getAllMcq)
//   .post(libraryController.createBook)

// router.route('/:id').get(libraryController.getBook)

module.exports = router
