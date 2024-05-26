const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const examController = require('../../Controllers/Courses/examController')
const factory = require('../../Controllers/Handlers/handlerFactory')
const answerController = require('../../Controllers/Courses/answerController')
const Student = require('../../Models/Users/StudentModel')
const Teacher = require('../../Models/Users/TeacherModel')

const router = express.Router({ mergeParams: true })
//params.lectureId
// #region Student
router.post(
  '/answers/submit',
  authController.protect(Student),
  authController.restrictTo('Student'),
  answerController.setQuizAnswerIds,
  answerController.submitQuiz,
)
router.get('/', authController.protect(Student), examController.getQuizStudent)
// #endregion
router.use(authController.protect(Teacher))
router.use(authController.restrictTo('Teacher', 'Admin'))
// #region Teacher
router
  .route('/admin')
  .post(factory.setLectureIds, examController.createQuiz)
  .get(examController.getQuizTeacher)
router.get('/all', examController.getAllQuizzes)
router
  .route('/:id')
  .patch(examController.updateQuiz)
  .delete(examController.deleteQuiz)
// #endregion

module.exports = router
