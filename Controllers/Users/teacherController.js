const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Teacher = require('../../Models/Users/TeacherModel')

exports.createTeacher = factory.createOne(Teacher)
exports.getAllTeachers = factory.getAll(Teacher, { path: 'coursesToTeach' })
exports.getAllTeachersGuest = factory.getAll(
  Teacher,
  {
    path: 'coursesToTeach',
  },
  ['examsMarked'],
)
exports.getTeacherGuest = factory.getOneExclude(
  Teacher,
  { path: 'coursesToTeach' },
  ['examsMarked'],
)
exports.ids = factory.getIds(Teacher)
