const express = require('express')
const questionController = require('../Controllers/Reviews/questionController')
const authController = require('../Controllers/Handlers/authController')
const studentController = require('../Controllers/Users/studentController')
const Student = require('../Models/Users/StudentModel')
const Teacher = require('../Models/Users/TeacherModel')
const { uploadQuestionImage } = require('../utils/cloudinaryMiddleware')
const upload = require('../multer')
const router = express.Router()
router.get('/ids', questionController.ids)

// #region Student
router.post(
  '/ask',
  authController.protect(Student),
  authController.restrictTo('Student'),
  studentController.setStudentId,
  upload.single('imageURL'),
  uploadQuestionImage,
  questionController.askQuestion,
)

router
  .route('/:id')
  .patch(
    authController.protect(Student),
    authController.restrictTo('Student'),
    questionController.updateQuestionAsker,
  )
  .delete(
    authController.protect(Student),
    authController.restrictTo('Student'),
    questionController.deleteQuestionAsker,
  )
// #endregion

// #region Teacher
router.use(
  authController.protect(Teacher),
  authController.restrictTo('Teacher', 'Admin'),
)

router.get('/', questionController.getAllQuestions)
router.patch('/answer/:id', questionController.answerQuestion)
router.delete('/:id/admin', questionController.deleteQuestion)
router.route('/:id').get(questionController.getOneQuestion)

// #endregion

module.exports = router
