const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const MCQAnswer = require('../Models/Exams/Answers/MCQAnswerModel')
const QuizAnswer = require('../Models/Exams/Answers/QuizAnswerModel')
const MEQAnswer = require('../Models/Exams/Answers/MEQAnswerModel')

exports.createMcqAnswer = factory.createOne(MCQAnswer, ['correct'])

exports.getAllMcqAnswers = factory.getAll(MCQAnswer)

exports.createQuizAnswer =
  //1- Create Answer
  //2- Mark
  catchAsync(async function (req, res, next) {
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

exports.getAllMeqAnswers = factory.getAll(MEQAnswer)

exports.createMeqAnswer = factory.createOne(MEQAnswer, ['score', 'feedback'])
