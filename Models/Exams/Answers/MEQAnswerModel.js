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
  try {
    // Populate 'meq' field
    await this.populate('meq')

    // Ensure 'meq' is populated
    if (!this.meq) {
      throw new Error('meq is not populated')
    }

    // Create formatted data object
    const keywordsString = this.meq.keywords.join(', ')
    const formattedData = {
      answerId: this.id.toString(), // Assuming _id of MeqAnswer is used as answerId
      question: this.meq.question,
      optimalAnswer: this.meq.optimalAnswer,
      keywords: keywordsString,
      student_answer: this.answer, // Assuming answer field in MeqAnswer represents student's answer
    }

    // Make GET request to AI service
    const response = await axios.get('https://ai-m3lb.onrender.com/mark', {
      data: formattedData,
    })

    // Extract and parse score from response data
    const score = parseFloat(response.data) // Assuming response data is an array with one object { answerId: 'nigga2', score: 5.0 }

    // Assign score to meqAnswer and save
    this.scoreByAi = score
    await this.save()

    console.log('Score updated successfully:', this)
    return this // Optionally return the updated document
  } catch (error) {
    // Handle errors
    console.error('Error occurred during marking:', error)
    throw error // Rethrow the error for the caller to handle
  }
}

const MEQAnswer = mongoose.model('MEQAnswer', meqAnswerSchema)
module.exports = MEQAnswer
