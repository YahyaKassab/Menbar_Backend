const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const factory = require('../Controllers/Handlers/handlerFactory')
const lectureController = require('../Controllers/Courses/lectureController')
const examController = require('../Controllers/Courses/examController')
const quizRouter = require('./Secondary/quizRouter')
const commentRouter = require('./Secondary/commentRouter')

const router = express.Router()

router.use('/:lectureId/comments', commentRouter)
router.use('/:lectureId/quiz', quizRouter)

router.use(authController.protect)
router.route('/ids').get(lectureController.ids)
// #region Student
router.get('/:id', lectureController.getLectureStudent)
// #endregion
router.use(authController.restrictTo('admin', 'teacher'))
// #region Teacher
router
  .route('/')
  .post(lectureController.createLecture)
  .get(lectureController.getAllLectures)
router
  .route('/:id')
  .patch(lectureController.updateLecture)
  .delete(authController.restrictTo('admin'), lectureController.deleteLecture)
router.use(factory.setLectureIds)
router
  .route('/:lectureId/mcq')
  .post(examController.createMcq)
  .get(examController.getAllMcqForLecture)
router
  .route('/:lectureId/mcq/:id')
  .patch(examController.updateMcq)
  .delete(examController.deleteMcq)
// #endregion

module.exports = router
