const mongoose = require('mongoose')
const MCQAnswer = require('./MCQAnswerModel')
const catchAsync = require('../../../utils/catchAsync')

const quizAnswerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'A grade must have a student'],
    },
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
      required: [true, 'Answer must have a lecture'],
    },
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quiz',
      required: [true, 'Answer must have a quiz'],
    },
    //MCQAnswer[]
    durationInMins: Number,
    lectureQuizzesGrades: Array, //MCQAnswer
    scoreFrom: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

quizAnswerSchema.virtual('score').get(function () {
  return (correctCount = this.lectureQuizzesGrades.filter(
    (quiz) => quiz.correct,
  ).length)
})

// quizAnswerSchema.pre(/^find/, function (next) {
//   this.populate('quiz')
//   next()
// })

const fillEmbedded = (fieldToFill, Model) => {
  return catchAsync(async function (req, res, next) {
    const fieldPromises = fieldToFill.map(async (item) => {
      if (typeof item === 'string' || item instanceof mongoose.Types.ObjectId) {
        // Assume item is an ID and fetch the corresponding document
        return await Model.findById(item)
      }
      // Assume item is already an object, return it as is
      return item
    })

    req.body[fieldToFill] = await Promise.all(fieldPromises)
    next()
  })
}
// quizAnswerSchema.pre('save', () =>
//   fillEmbedded(this.lectureQuizzesGrades, MCQAnswer),
// )

const QuizAnswer = mongoose.model('QuizAnswer', quizAnswerSchema)
module.exports = QuizAnswer
