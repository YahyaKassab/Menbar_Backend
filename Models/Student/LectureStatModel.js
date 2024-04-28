const mongoose = require('mongoose')

const lectureStatSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
      required: [true, 'A lectureStat must have a lecture id'],
    },
    latestQuizGrade: {
      type: mongoose.Schema.ObjectId,
      ref: 'QuizAnswer',
    },
    bestQuizScore: Number,
    latestQuizScore: Number,
    done: Boolean,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

lectureStatSchema.virtual('student',{
  ref:'Student',
  localField:'_id',
  foreignField:''
})

const LectureStat = mongoose.model('LectureStat', lectureStatSchema)

module.exports = LectureStat
