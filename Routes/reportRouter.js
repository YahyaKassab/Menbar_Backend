const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const examController = require('../Controllers/Courses/examController')
const answerController = require('../Controllers/Courses/answerController')
const Student = require('../Models/Users/StudentModel')
const Teacher = require('../Models/Users/TeacherModel')

const router = express.Router()

router.get('/', answerController.getAllReports)
router.delete('/delete-viewed', answerController.deleteViewed)
router.post('/create/:answerId', answerController.reportAi)
router.patch('/resolve/:id', answerController.resolveReport)
router
  .route('/:id')
  .get(answerController.getReport)
  .delete(answerController.deleteReport)
router
module.exports = router
