const mongoose = require('mongoose')

const reportAiSchema = new mongoose.Schema({
  answer: {
    type: mongoose.Schema.ObjectId,
    ref: 'MEQAnswer',
    required: [true, 'A report must have an answer'],
    unique: true,
  },
  description: String,
  viewed: { type: Boolean, default: false },
})

const ReportAi = mongoose.model('ReportAi', reportAiSchema)
module.exports = ReportAi
