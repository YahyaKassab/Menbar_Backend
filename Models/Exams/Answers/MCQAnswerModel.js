const mongoose = require('mongoose')

const mcqAnswerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'An answer must have a student'],
    },
    mcq: {
      type: mongoose.Schema.ObjectId,
      ref: 'MCQ',
    },
    answer: Number, // 0:3 order of the choice
    correct: Boolean, //  mark method get the mcq and compare the 'answer' from the question with the 'answer' in here to assign to this
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

mcqAnswerSchema.methods.markAnswer = async function () {
  // Ensure that the mcq field is populated
  await this.populate('mcq')

  // Check if the student's answer matches the correct answer
  if (this.answer === this.mcq.answer) {
    this.correct = true
  } else {
    this.correct = false
  }
  console.log('correct:', this.correct)
  // Save the updated document
  await this.save()

  return this.correct
}

const MCQAnswer = mongoose.model('MCQAnswer', mcqAnswerSchema)

module.exports = MCQAnswer
