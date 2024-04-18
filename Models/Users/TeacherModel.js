const mongoose = require('mongoose')
const User = require('./UserModel')
const catchAsync = require('../../utils/catchAsync')

const teacherSchema = new mongoose.Schema({
  // Additional fields specific to Teachers
  examsMarked: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'FinalExamStudentAnswer',
    },
  ],
  coursesToTeach: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
    },
  ],
  qualifications: String,
  educationLevel: String,
})

const Teacher = User.discriminator('Teacher', teacherSchema)

module.exports = Teacher
