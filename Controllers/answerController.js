const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const MCQAnswer = require('../Models/Exams/Answers/MCQAnswerModel')

exports.createMcqAnswer = factory.createOne(MCQAnswer)
exports.markAnswer = catchAsync(async (req, res) => {
  const answer = await MCQAnswer.findById(req.params.id)
  const mark = await answer.markAnswer()
  console.log('mark: ', mark)
  res.status(200).json({
    status: 'Success',
    data: mark,
  })
})
exports.getAllMcqAnswers = factory.getAll(MCQAnswer)
