const mongoose = require('mongoose')
const Lecture = require('./LectureModel')
const Teacher = require('../Users/TeacherModel')
const Student = require('../Users/StudentModel')
const catchAsync = require('../../utils/catchAsync')
const LibraryItem = require('./LibraryItemModel')
const courseSchema = new mongoose.Schema(
  {
    text: String,
    level: Number,
    description: String,
    subject: {
      type: String,
      enum: ['aqeedah', 'hadeeth', 'fiqh', 'tafseer'],
    },
    libraryItem: {
      type: mongoose.Schema.ObjectId,
      ref: 'LibraryItem',
      required: [true, 'A Course must have a library Item'],
    },
    students: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
      },
    ],
    teachers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Teacher',
      },
    ], //Teacher
    lectures: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Lecture',
      },
    ], //Lecture
    prerequisites: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

courseSchema.post('save', async function (docs, next) {
  // Fetch all enrolled students
  const course = this
  await Promise.all(
    this.students.map(async (student) => {
      await Student.findByIdAndUpdate(student, {
        $push: { courseStats: { course: course._id } },
      })
      // .then((val) => console.log(val))
    }),
    this.teachers.map(async (teacher) => {
      await Teacher.findByIdAndUpdate(teacher, {
        $push: { coursesToTeach: course._id },
      })
      // .then((val) => console.log(val))
    }),
  )
  await LibraryItem.findByIdAndUpdate(this.libraryItem, { course: course._id })

  next()
})

// Embed document on Saving
// courseSchema.pre('save', async function (next) {
//   const lecturesPromises = this.lectures.map(
//     async (id) => await Lecture.findById(id),
//   )
//   const teachersPromises = this.teachers.map(
//     async (id) => await Teacher.findById(id),
//   )
//   this.teachers = await Promise.all(teachersPromises)
//   this.lectures = await Promise.all(lecturesPromises)
//   next()
// })
const Course = mongoose.model('Course', courseSchema)

module.exports = Course
