const mongoose = require('mongoose')
const axios = require('axios')

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
    const formattedData = {
      answerId: this._id, // Assuming _id of MeqAnswer is used as answerId
      question: this.meq.question,
      optimalAnswer: this.meq.optimalAnswer,
      keywords: this.meq.keywords,
      student_answer: this.answer, // Assuming answer field in MeqAnswer represents student's answer
    }
    await axios.get()
    await this.save()
  } catch (error) {
    // Handle errors here if needed
    console.error('Error occurred during marking:', error)
    throw error // Rethrow the error for the caller to handle
  }
}

const MEQAnswer = mongoose.model('MEQAnswer', meqAnswerSchema)
module.exports = MEQAnswer
