const mongoose = require('mongoose')
const QuizAnswer = require('./Answers/QuizAnswerModel')

const LectureQuizSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
      required: [true, 'An quiz must have a Lecture'],
    },
    mcq: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'MCQ',
      },
    ],
    avgTries: Number,
    numberOfAnswers: Number,
    durationInMins: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

LectureQuizSchema.pre('findOne', async function (next) {
  this.populate([{ path: 'lecture', select: 'name' }, { path: 'mcq' }])
  next()
})

LectureQuizSchema.post('findOne', async function (doc, next) {
  if (doc) {
    const count = await QuizAnswer.countDocuments({ quiz: doc._id })
    const answers = await QuizAnswer.find({ quiz: doc._id })

    // Calculate the total number of tries
    const totalTries = answers.reduce(
      (total, answer) => total + answer.tries,
      0,
    )

    // Calculate the average tries
    const avgTries = answers.length > 0 ? totalTries / answers.length : 0

    doc.numberOfAnswers = count
    doc.avgTries = avgTries
  }
  next()
})

const LectureQuiz = mongoose.model('LectureQuiz', LectureQuizSchema)
module.exports = LectureQuiz
