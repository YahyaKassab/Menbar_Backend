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
    finalAnswers: {
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
// Virtual for totalLecturesScore
courseStatsSchema.virtual('totalLecturesScore').get(function () {
  if (this.lecturesStats && this.lecturesStats.length > 0) {
    return this.lecturesStats.reduce((total, lectureStat) => {
      return total + (lectureStat.bestQuizScore || 0)
    }, 0)
  }
  return 0
})
courseStatsSchema.virtual('totalScore').get(function () {
  // Ensure finalAnswers is populated
  if (this.finalAnswers && this.finalAnswers.score) {
    return (this.totalLecturesScore || 0) + this.finalAnswers.score
  }
  // If finalAnswers is not populated or does not have a score, return totalLecturesScore only
  return this.totalLecturesScore || 0
})
courseStatsSchema.virtual('passed').get(function () {
  return this.totalScore >= 50
})

const CourseStat = mongoose.model('CourseStats', courseStatsSchema)

module.exports = CourseStat
