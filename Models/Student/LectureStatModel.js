const mongoose = require('mongoose')

const lectureStatSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
      required: [true, 'A lectureStat must have a lecture id'],
    },
    latestQuizGrade: {
      type: mongoose.Schema.ObjectId,
      ref: 'QuizAnswer',
    },
    bestQuizScore: Number,
    latestQuizScore: Number,
    done: Boolean,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

lectureStatSchema.pre('save', async function (next) {
  const latestQuizGradePromises = this.latestQuizGrade.map(
    async (id) => await MCQGrade.findById(id),
  )
  this.latestQuizGrade = await Promise.all(latestQuizGradePromises)
  next()
})

const LectureStat = mongoose.model('LectureStat', lectureStatSchema)

module.exports = LectureStat
