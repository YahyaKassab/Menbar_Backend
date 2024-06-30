const mongoose = require('mongoose')
const catchAsync = require('../../../utils/catchAsync')

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
//mark
mcqAnswerSchema.methods.mark = async function () {
  try {
    // Ensure that the mcq field is populated
    await this.populate('mcq')

    // Check if the student's answer matches the correct answer
    if(!this.answer)this.correct = false
    else{
    if (this.answer === this.mcq.answer) {
      this.correct = true
    } else {
      this.correct = false
    }
  }
    // console.log('correct:', this.correct)

    // Save the updated thisument
    await this.save()
  } catch (error) {
    // Handle errors here if needed
    console.error('Error occurred during marking:', error)
    throw error // Rethrow the error for the caller to handle
  }
}

const MCQAnswer = mongoose.model('MCQAnswer', mcqAnswerSchema)

module.exports = MCQAnswer
