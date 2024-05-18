const mongoose = require('mongoose')
const courseStatsSchema = new mongoose.Schema(
  {
    // reference to the course
    TotalScore: Number,
    lectureQuizzesScores: [Number],
    finalsScore: Number,
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'A stat must have a course'],
    },

    lecturesStats: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'LectureStat',
      },
    ], //LectureStat
    lecturesDone: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Lecture',
      },
    ], //Lecture
    answers: {
      type: mongoose.Schema.ObjectId,
      ref: 'FinalExamStudentAnswer',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

courseStatsSchema.pre(/^find/, function (next) {
  this.populate('course').populate('lecturesStats').populate('answers')
  next()
})

const CourseStats = mongoose.model('CourseStats', courseStatsSchema)

module.exports = CourseStats
