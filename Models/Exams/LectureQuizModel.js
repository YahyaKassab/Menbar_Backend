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
    durationInMins: Number,
    scoreFrom: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
LectureQuizSchema.virtual('numberOfAnswers').get(async function () {
  const count = await QuizAnswer.countDocuments({ quiz: this._id })
  return count
})
LectureQuizSchema.virtual('avgTries').get(async function () {
  const answers = await QuizAnswer.find({ quiz: this._id })
  // console.log('answer:', answers)
  // Calculate the total number of tries
  const totalTries = answers.reduce((total, answer) => total + answer.tries, 0)

  // Calculate the average tries
  const avgTries = answers.length > 0 ? totalTries / answers.length : 0

  return avgTries
})
const LectureQuiz = mongoose.model('LectureQuiz', LectureQuizSchema)
module.exports = LectureQuiz
