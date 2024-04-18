const mongoose = require('mongoose')
const { finalsStatSchema } = require('./FinalsStatModel')
const CourseStatsSchema = new mongoose.Schema({
  // reference to the course
  TotalScore: Number,
  lectureQuizzesScores: [Number],
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
  ],
  lecturesDone: Array,
  finalsStat: finalsStatSchema,
})
const CourseStats = mongoose.model('CourseStats', CourseStatsSchema)

module.exports = CourseStats
