const mongoose = require('mongoose')
const MCQGrade = require('./MCQGradesModel')

const lectureStatSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lecture',
    required: [true, 'A lectureStat must have a lecture id'],
  },
  latestQuizGrade: {
    type: mongoose.Schema.ObjectId,
    ref: 'MCQGrade',
  },
  bestQuizScore: Number,
  latestQuizScore: Number,
  done: Boolean,
})

LectureStatSchema.pre('save', async function (next) {
  const latestQuizGradePromises = this.latestQuizGrade.map(
    async (id) => await MCQGrade.findById(id),
  )
  this.latestQuizGrade = await Promise.all(latestQuizGradePromises)
  next()
})

const LectureStat = User.discriminator('LectureStat', lectureStatSchema)

module.exports = LectureStat
