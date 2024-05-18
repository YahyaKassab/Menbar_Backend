const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const lectureController = require('../Controllers/Courses/lectureController')
const examController = require('../Controllers/Courses/examController')
const quizRouter = require('./Secondary/quizRouter')
const commentRouter = require('./Secondary/commentRouter')

const router = express.Router({ mergeParams: true })

router.use('/:lectureId/comments', commentRouter)
router.use('/:lectureId/quiz', quizRouter)

router.use(authController.protect)
router.route('/ids').get(lectureController.ids)
// #region Student
router.get('/:id', lectureController.getLectureStudent)
router.get('/:lectureId/mcq', lectureController.getLectureStudent)
// #endregion

// #region Teacher
router
  .route('/')
  .post(
    authController.restrictTo('admin', 'teacher'),
    lectureController.createLecture,
  )
  .get(
    authController.restrictTo('admin', 'teacher'),
    lectureController.getAllLectures,
  )
router
  .route('/:id')
  .patch(
    authController.restrictTo('admin', 'teacher'),
    lectureController.updateLecture,
  )
  .delete(authController.restrictTo('admin'), lectureController.deleteLecture)
router
  .route('/:lectureId/mcq')
  .post(authController.restrictTo('admin', 'teacher'), examController.createMcq)
  .patch(
    authController.restrictTo('admin', 'teacher'),
    examController.updateMcq,
  )
  .delete(
    authController.restrictTo('admin', 'teacher'),
    examController.deleteMcq,
  )
// #endregion

module.exports = router
