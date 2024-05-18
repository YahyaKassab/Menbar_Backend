const Question = require('../../Models/Exams/QuestionModel')
const catchAsync = require('../../utils/catchAsync')
const factory = require('../Handlers/handlerFactory')

exports.ids = factory.getIds(Question)
exports.askQuestion = factory.createOne(Question, ['answer'])
exports.answerQuestion = factory.updateOneFields(Question, ['answer'])
exports.updateQuestionAsker = catchAsync(async (req, res, next) => {
  const id = req.params.id
  const doc = await Question.findByIdAndUpdate(
    id,
    {
      $and: [
        { _id: id }, // Ensure that the Question ID matches
        { asker: req.user.id }, // Ensure that the student matches
      ],
      ...factory.exclude(req.body, ['asker', 'FAQ', 'answer']), // Include other fields for update
    },
    {
      // Return the updated doc not the original one
      new: true,
      // Will run validation on DB
      // If set to false, the DB will accept anything
      runValidators: true,
    },
  )

  if (!doc) {
    return next(new AppError('No document found or No permission', 404))
  }

  res.status(200).json({
    status: 'Success',
    data: doc,
  })
})
exports.updateQuestionAdmin = factory.updateOne(Question)
exports.getAllQuestions = factory.getAll(Question)
exports.getOneQuestion = factory.getOne(Question)
exports.deleteQuestion = factory.deleteOne(Question)
exports.deleteQuestionAsker = catchAsync(async (req, res, next) => {
  const question = await Question.findById(req.params.id)

  if (!question) {
    return next(new AppError('No question found with that ID', 404))
  }

  // Check if the asker matches the user id
  if (question.asker.toString() !== req.user.id) {
    return next(
      new AppError('You are not authorized to delete this question', 403),
    )
  }

  await Question.findByIdAndDelete(req.params.id)

  res.status(204).json({ status: 'success', data: null })
})
