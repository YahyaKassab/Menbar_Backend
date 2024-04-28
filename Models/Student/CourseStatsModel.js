const mongoose = require('mongoose')
const { finalsStatSchema } = require('./FinalsStatModel')
const courseStatsSchema = new mongoose.Schema(
  {
    // reference to the course
    TotalScore: Number,
    lectureQuizzesScores: [Number],
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'A stat must have a course'],
    },

    lecturesStats: Array, //LectureStat
    lecturesDone: Array, //Lecture
    finalsStat: Array, //FinalsStat
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
courseStatsSchema.pre('save', async function (next) {
  // const answersPromises = this.answers.map(
  //   async (id) => await FinalExamStudentAnswer.findById(id),
  // )
  // this.answers = await Promise.all(answersPromises)
  // next()
})
const CourseStats = mongoose.model('CourseStats', courseStatsSchema)

module.exports = CourseStats
