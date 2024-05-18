const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const MCQAnswer = require('../../Models/Exams/Answers/MCQAnswerModel')
const QuizAnswer = require('../../Models/Exams/Answers/QuizAnswerModel')
const MEQAnswer = require('../../Models/Exams/Answers/MEQAnswerModel')
const FinalExamStudentAnswer = require('../../Models/Exams/Answers/FinalExamStudentAnswerModel')

// #region Final
exports.submitFinalAnswer = catchAsync(async function (req, res, next) {
  let body = req.body
  const answers = await MCQAnswer.create(body.mcqs)
  for (const answer of answers) {
    await answer.mark()
  }
  body.mcqs = answers

  const newBody = factory.exclude(body, ['score', 'scoreFrom', 'marked'])

  const exam = await FinalExamStudentAnswer.create(newBody)
  res.status(201).json({
    status: 'Success',
    data: exam,
  })
})

exports.getAllFinalAnswers = factory.getAll(FinalExamStudentAnswer, {
  path: 'student',
  select: 'user.Fname',
})

exports.getFinalAnswer = factory.getOne(FinalExamStudentAnswer, [
  'student',
  'exam',
])
exports.markFinalAnswer = catchAsync(async function (req, res, next) {
  const { meqId, score, feedback } = req.body

  // Assuming you have the student answer ID (e.g., from a URL parameter)
  const studentAnswerId = req.params.id

  // Update the MEQs array
  const doc = await FinalExamStudentAnswer.findOneAndUpdate(
    { _id: studentAnswerId },
    {
      $set: {
        'MEQs.$[elem].score': score,
        'MEQs.$[elem].feedback': feedback,
      },
    },
    {
      arrayFilters: [{ 'elem.meqId': meqId }],
      new: true, // Return the updated document
    },
  )
  if (!doc)
    return res
      .status(404)
      .json({ status: 'Error', message: 'Student answer not found' })

  res.status(200).json({ status: 'Success', data: doc })
})

// #endregion

// #region Quiz
// #endregion

// #region MCQ
// #endregion

// #region MEQ
// #endregion

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
