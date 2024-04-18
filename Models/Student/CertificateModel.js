const mongoose = require('mongoose')
const certificateSchema = new mongoose.Schema({
  // reference to the course
  course: {
    type: mongoose.Schema.ObjectId,
    ref: 'Course',
    required: [true, 'A certificate must have a course'],
  },
  imageURL: String,
  Date: Date,
})
const Certificate = User.discriminator('Certificate', certificateSchema)

module.exports = Certificate
