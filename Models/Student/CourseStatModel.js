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
//LectureStat
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
    strictPopulate: false,
  },
)

courseStatsSchema.virtual('lectureStats', {
  ref: 'LectureStat',
  localField: '_id',
  foreignField: 'courseStat',
})

// Virtual for totalLecturesScore
courseStatsSchema.virtual('totalLecturesScore').get(async function () {
  // Populate lecturesStats
  await this.populate('lecturesStats')

  // Check if lecturesStats exists and is populated
  if (this.lecturesStats && this.lecturesStats.length > 0) {
    // Sum up the bestQuizScore of each lectureStat
    return this.lecturesStats.reduce((total, lectureStat) => {
      return total + (lectureStat.bestQuizScore || 0);
    }, 0);
  }
  // If lecturesStats doesn't exist or is empty, return 0
  return 0;
});


courseStatsSchema.virtual('totalScore').get(function () {
  // Ensure finalAnswers is populated and has a score
  const finalAnswersScore = this.finalAnswers && this.finalAnswers.score ? this.finalAnswers.score : 0;
  const totalLecturesScore = this.totalLecturesScore || 0;
  
  return totalLecturesScore + finalAnswersScore;
});

courseStatsSchema.virtual('passed').get(function () {
  return this.totalScore >= 50;
});

const CourseStat = mongoose.model('CourseStats', courseStatsSchema)

module.exports = CourseStat
