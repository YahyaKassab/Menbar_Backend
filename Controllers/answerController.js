const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const MCQAnswer = require('../Models/Exams/Answers/MCQAnswerModel')
const QuizAnswer = require('../Models/Exams/Answers/QuizAnswerModel')

exports.createMcqAnswer = factory.createOne(MCQAnswer)

// exports.markAnswer = catchAsync(async (req, res) => {
//   const answer = await MCQAnswer.findById(req.params.id)
//   const mark = await answer.markAnswer()
//   console.log('mark: ', mark)
//   res.status(200).json({
//     status: 'Success',
//     data: mark,
//   })
// })
exports.getAllMcqAnswers = factory.getAll(MCQAnswer)
exports.createQuizAnswer = catchAsync(async function (req, res, next) {
  let body = req.body
  const quizId = req.params.id
  const answers = await MCQAnswer.create(body.lectureQuizzesGrades)
  for (const answer of answers) {
    await answer.mark()
  }
  body.lectureQuizzesGrades = answers

  body.quiz = quizId

  const quiz = await QuizAnswer.create(body)
  res.status(201).json({
    status: 'Success',
    data: quiz,
  })
})
