const express = require('express')
const authController = require('../Controllers/authController')
const lectureController = require('../Controllers/lectureController')
const quizRouter = require('./quizRouter')
const commentRouter = require('./commentRouter')

const router = express.Router()

router.use('/:lectureId/comments', commentRouter)
router.use('/:lectureId/quiz', quizRouter)

router
  .route('/')
  .post(lectureController.createLecture)
  .get(lectureController.getAllLecture)

router
  .route('/:id')
  .get(lectureController.getOneLecture)
  .patch(lectureController.updateLecture)
  .delete(lectureController.deleteLecture)
// router.route('/:id').get()

module.exports = router
