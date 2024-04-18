const mongoose = require('mongoose')
const CourseStatsSchema = new mongoose.Schema({
  // reference to the course
  TotalScore: Number,
  lectureQuizzesScores: Array,
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
  finalsStat: {
    type: mongoose.Schema.ObjectId,
    ref: 'FinalsStat',
  },
})
const CourseStats = User.discriminator('CourseStats', CourseStatsSchema)

module.exports = CourseStats
