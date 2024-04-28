const express = require('express')
const answerController = require('../Controllers/answerController')

const router = express.Router()

router.route('/mcq').get(answerController.getAllMcqAnswers).post(
  // authController.protect,
  //authController.restrictTo(''),
  answerController.createMcqAnswer,
)
router.route('/:id').get(answerController.markAnswer)

//   .patch(
//     authController.protect,
//     //authController.restrictTo(''),
//     answerController.updateAnswer,
//   )
//   .delete(
//     authController.protect,
//     //authController.restrictTo(''),
//     answerController.deleteAnswer,
//   )

module.exports = router
