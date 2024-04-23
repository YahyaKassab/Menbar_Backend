const mongoose = require('mongoose')

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
    avgTries: Number,
    scoreFrom: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const LectureQuiz = mongoose.model('LectureQuiz', LectureQuizSchema)
module.exports = LectureQuiz
