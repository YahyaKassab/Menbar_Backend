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
    totalLecturesScoreOutOf10:Number,
    totalScore:Number,
    passed:Boolean

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
// // Virtual for totalLecturesScoreOutOf10
// courseStatsSchema.virtual('totalLecturesScoreOutOf10').get(function () {
//   if (this.lectureStats && this.lectureStats.length > 0) {
//     const totalPossibleScore = this.lectureStats.length * 3; // Each lectureQuiz is out of 3 points

//     // Sum up the bestQuizScore of each lectureStat
//     const totalScore = this.lectureStats.reduce((total, lectureStat) => {
//       return total + (lectureStat.bestQuizScore || 0);
//     }, 0);

//     // Calculate percentage score out of 100
//     const percentageScore = (totalScore / totalPossibleScore) * 100;

//     // Scale the percentage score to a score out of 10
//     const scoreOutOf10 = (percentageScore / 10).toFixed(1); // Round to one decimal place

//     return parseFloat(scoreOutOf10); // Convert to float (if needed) and return
//   }

//   // If lecturesStats doesn't exist or is empty, return 0
//   return 0;
// });

// // Virtual for totalScore
// courseStatsSchema.virtual('totalScore').get(function () {
//   // Ensure finalAnswers is populated synchronously
//   console.log('final score:',this.finalAnswers.score);
//   if (this.finalAnswers && this.finalAnswers.score) {
//     const finalAnswersScore = this.finalAnswers.score;
//     const totalLecturesScore = this.totalLecturesScoreOutOf10 || 0;
    
//     return totalLecturesScore + finalAnswersScore;
//   }

//   return 0;
// });

// // Virtual for passed
// courseStatsSchema.virtual('passed').get(function () {
//   return this.totalScore >= 50;
// });

const CourseStat = mongoose.model('CourseStats', courseStatsSchema)

module.exports = CourseStat
