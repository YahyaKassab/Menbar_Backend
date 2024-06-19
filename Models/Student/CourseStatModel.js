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
    finalAnswers: {
      type: mongoose.Schema.ObjectId,
      ref: 'FinalExamStudentAnswer',
    },
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

// Virtual for totalLecturesScore
courseStatsSchema.virtual('totalLecturesScoreOutOf10').get(async function () {
  // Populate lecturesStats
  await this.populate('lecturesStats')

  // Check if lecturesStats exists and is populated
  if (this.lecturesStats && this.lecturesStats.length > 0) {
    // Calculate the total possible score based on lecturesStats
    const totalPossibleScore = this.lecturesStats.length * 3 // Each lectureQuiz is out of 3 points

    // Sum up the bestQuizScore of each lectureStat
    const totalScore = this.lecturesStats.reduce((total, lectureStat) => {
      return total + (lectureStat.bestQuizScore || 0)
    }, 0)

    // Calculate percentage score out of 100
    const percentageScore = (totalScore / totalPossibleScore) * 100

    // Scale the percentage score to a score out of 10
    const scoreOutOf10 = (percentageScore / 10).toFixed(1) // Round to one decimal place

    return parseFloat(scoreOutOf10) // Convert to float (if needed) and return
  }

  // If lecturesStats doesn't exist or is empty, return 0
  return 0
})

courseStatsSchema.virtual('totalScore').get(function () {
  // Ensure finalAnswers is populated and has a score
  const finalAnswersScore =
    this.finalAnswers && this.finalAnswers.score ? this.finalAnswers.score : 0
  const totalLecturesScore = this.totalLecturesScore || 0

  return totalLecturesScore + finalAnswersScore
})

courseStatsSchema.virtual('passed').get(function () {
  return this.totalScore >= 50
})

const CourseStat = mongoose.model('CourseStats', courseStatsSchema)

module.exports = CourseStat
