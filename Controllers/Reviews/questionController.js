const Question = require('../../Models/Exams/QuestionModel')
const catchAsync = require('../../utils/catchAsync')
const factory = require('../Handlers/handlerFactory')
const authController = require('../Handlers/authController')

exports.ids = factory.getIds(Question)
exports.askQuestion = catchAsync(async (req, res, next) => {
  req.body.asker = req.student.id
  const question = await Question.create(
    factory.exclude(req.body, ['answer', 'FAQ']),
  )

  res.status(201).json({
    status: 'Success',
    data: question,
  })
})
exports.answerQuestion = catchAsync(async (req, res, next) => {
  const id = req.params.id
  const answer = {
    answer: {
      text: req.body.text,
      teacher: req.teacher.id,
    },
  }
  const doc = await Question.findByIdAndUpdate(id, answer, {
    new: true,
    runValidators: true,
  })

  if (!doc) {
    return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
  }

  res.status(200).json({
    status: 'Success',
    data: doc,
  })
})
exports.updateQuestionAsker = catchAsync(async (req, res, next) => {
  const id = req.params.id
  const body = factory.exclude(req.body, ['asker', 'FAQ', 'answer'])
  const doc = await Question.findOneAndUpdate(
    {
      _id: id, // Ensure that the Question ID matches
      asker: req.student.id, // Ensure that the student matches
    },
    body, // Include other fields for update
    {
      new: true, // Return the updated doc, not the original one
      runValidators: true, // Will run validation on DB
    },
  )

  if (!doc) {
    return next(
      new AppError(
        'لم يتم العثور على الملف المطلوب أو لا يسمح لك الحصول عليه',
        404,
      ),
    )
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
    return next(new AppError('لم يتم العثور على السؤال المطلوب', 404))
  }

  // Check if the asker matches the user id
  if (question.asker.toString() !== req.student.id) {
    return next(new AppError('لا يسمح لك بمسح هذا السؤال', 403))
  }

  await Question.findByIdAndDelete(req.params.id)

  res.status(204).json({ status: 'success', data: null })
})
