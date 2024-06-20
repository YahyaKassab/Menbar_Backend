const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const factory = require('../Controllers/Handlers/handlerFactory')
const lectureController = require('../Controllers/Courses/lectureController')
const examController = require('../Controllers/Courses/examController')
const quizRouter = require('./Secondary/quizRouter')
const commentRouter = require('./Secondary/commentRouter')
const Student = require('../Models/Users/StudentModel')
const Teacher = require('../Models/Users/TeacherModel')

const router = express.Router({ mergeParams: true })

router.use('/:lectureId/comments', commentRouter)
router.use('/:lectureId/quiz', quizRouter)

router.post('/allQuizzes', examController.createAllFinals)

router.get('/next/:order/:course', lectureController.nextLecture)
router.get('/prev/:order/:course', lectureController.prevLecture)

router.route('/ids').get(lectureController.ids)
// #region Student
router.get(
  '/:id',
  authController.protect(Student),
  lectureController.getLectureStudent,
)
// #endregion

router.use(
  authController.protect(Teacher),
  authController.restrictTo('Admin', 'Teacher'),
)
// #region Teacher
router
  .route('/')
  .post(lectureController.createLecture)
  .get(lectureController.getAllLectures)
router
  .route('/:id')
  .patch(lectureController.updateLecture)
  .delete(authController.restrictTo('admin'), lectureController.deleteLecture)
router.get('/admin/:id', lectureController.getOneLectureTeacher)
router.get(
  '/mcq/:lectureId',
  factory.setLectureIds,
  examController.getAllMcqForLecture,
)
// #endregion

module.exports = router
