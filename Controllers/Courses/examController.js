const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Lecture = require('../../Models/Courses/LectureModel')
const MCQ = require('../../Models/Exams/MCQModel')
const MEQ = require('../../Models/Exams/MEQModel')
const LectureQuiz = require('../../Models/Exams/LectureQuizModel')
const FinalExam = require('../../Models/Exams/FinalExamModel')

exports.setLectureMcqIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.lecture) req.body.lecture = req.params.lectureId
  console.log('lecture: ', req.body.lecture)
  //   if (!req.body.user) req.body.user = req.user.id
  next()
}
// #region Final
exports.getAllFinals = factory.getAll(FinalExam)
exports.getFinal = factory.getOne(FinalExam)
exports.createFinal = factory.createOne(FinalExam)
exports.updateFinal = factory.updateOne(FinalExam)
exports.deleteFinal = factory.deleteOne(FinalExam)
// #endregion

// #region Quiz
// #endregion

// #region MCQ

exports.createMcq = factory.createOne(MCQ)
exports.updateMcq = factory.updateOne(MCQ)
exports.deleteMcq = factory.deleteOne(MCQ)
exports.getAllMcq = factory.getAll(MCQ)
// #endregion

// #region MEQ
// #endregion

exports.createQuiz = factory.createOne(LectureQuiz)
exports.getAllQuizzes = factory.getAll(LectureQuiz)
exports.createMeq = factory.createOne(MEQ)
exports.getAllMeq = factory.getAll(MEQ)
