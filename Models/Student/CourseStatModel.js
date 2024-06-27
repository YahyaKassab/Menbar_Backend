const mongoose = require('mongoose')
const courseStatsSchema = new mongoose.Schema(
  {
    // reference to the course
    lectureQuizzesScores: [Number],
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'A stat must have a course'],
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'A stat must have a student'],
    },
    totalLecturesScoreOutOf10: Number,
    totalScore: Number,
    passed: Boolean,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictPopulate: false,
  },
)

courseStatsSchema.virtual('lectureStats', {
  ref: 'LectureStat',
  localField: '_id',
  foreignField: 'courseStat',
})
courseStatsSchema.virtual('finalAnswers', {
  ref: 'FinalExamStudentAnswer',
  localField: '_id',
  foreignField: 'courseStat',
  justOne: true,
})
const CourseStat = mongoose.model('CourseStats', courseStatsSchema)

module.exports = CourseStat
