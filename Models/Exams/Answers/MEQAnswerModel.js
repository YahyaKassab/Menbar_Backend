const mongoose = require('mongoose')

const meqAnswerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'An answer must have a student'],
    },
    meq: {
      type: mongoose.Schema.ObjectId,
      ref: 'MEQ',
    },
    answer: String,
    scoreByTeacher: Number,
    scoreByAi: Number,

    feedback: {
      text: String,
      date: {
        type: Date,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

meqAnswerSchema.methods.markAi = async function () {
  //Mark using ai model
  try {
    // Ensure that the mcq field is populated
    await this.populate('meq')

    // Check if the student's answer matches the correct answer
    if (this.answer === this.meq.optimalAnswer) {
      this.scoreByAi = 5
    } else {
      this.scoreByAi = 3
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

const MEQAnswer = mongoose.model('MEQAnswer', meqAnswerSchema)
module.exports = MEQAnswer
