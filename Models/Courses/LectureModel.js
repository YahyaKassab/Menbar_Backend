const mongoose = require('mongoose')
const lectureSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'A lecture must have a name'] },
  order: Number,
  videoLink: {
    type: String,
    required: [true, 'A lecture must have a video'],
  },
  comments: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
    },
  ],
})
const Lecture = mongoose.model('Lecture', lectureSchema)

module.exports = Lecture
