const mongoose = require('mongoose')

const lectureStatSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
      required: [true, 'A lectureStat must have a lecture id'],
    },
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'A lectureStat must have a student id'],
    },
    courseStat:{
      type: mongoose.Schema.ObjectId,
      ref: 'CourseStat',
      required: [true, 'A lectureStat must have a course Stat id'],
    },
    latestQuizGrade: {
      type: mongoose.Schema.ObjectId,
      ref: 'QuizAnswer',
    },
    bestQuizScore: Number,
    latestQuizScore: Number,
    done: { type: Boolean, default: false },
    open: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// lectureStatSchema.pre(/^find/, function (next) {
//   this.populate('lecture').populate('latestQuizGrade')
//   next()
// })
const LectureStat = mongoose.model('LectureStat', lectureStatSchema)

module.exports = LectureStat
