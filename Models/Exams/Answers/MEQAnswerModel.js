const mongoose = require('mongoose')
const axios = require('axios')
const {predictScore} = require('../../../Controllers/Courses/aiController')

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
      question: this.meq.question,
      optimalAnswer: this.meq.optimalAnswer,
      keywords: keywordsString,
      student_answer: this.answer, // Assuming answer field in MeqAnswer represents student's answer
    }


  const score = await predictScore(formattedData)
  // Assign score to meqAnswer and save
  this.scoreByAi = parseInt(score)
  await this.save()



    console.log('Score updated successfully:', this.scoreByAi)
    return this // Optionally return the updated document
  } catch (error) {
    // Handle errors
    console.error('Error occurred during marking:', error)
    throw error // Rethrow the error for the caller to handle
  }
}

const MEQAnswer = mongoose.model('MEQAnswer', meqAnswerSchema)
module.exports = MEQAnswer
