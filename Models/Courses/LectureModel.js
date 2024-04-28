const mongoose = require('mongoose')
const lectureSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'A lecture must have a name'] },
    order: Number,
    videoLink: {
      type: String,
      required: [true, 'A lecture must have a video'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

lectureSchema.virtual('quiz', {
  ref: 'LectureQuiz',
  localField: '_id',
  foreignField: 'lecture',
})
const Lecture = mongoose.model('Lecture', lectureSchema)

module.exports = Lecture
