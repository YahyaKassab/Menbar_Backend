const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Teacher = require('../../Models/Users/TeacherModel')
const authController = require('../Handlers/authController')

exports.loginTeacher = authController.login(Teacher)
exports.forgetPasswordTeacher = authController.forgotPassword(Teacher)
exports.resetPasswordTeacher = authController.resetPassword(Teacher)

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

exports.getTeacher = factory.getOne(Teacher, { path: 'coursesToTeach' })

exports.updateTeacher = factory.updateOne(Teacher)
exports.deleteTeacher = factory.deleteOne(Teacher)
exports.ids = factory.getIds(Teacher)
