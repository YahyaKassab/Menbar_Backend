const mongoose = require('mongoose')

exports.mcqSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lecture',
  },
  question: String,
  choices: [String],
  answer: Number,
})

exports.MCQ = mongoose.model('MCQ', mcqSchema)
