const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Teacher = require('../../Models/Users/TeacherModel')
const authController = require('../Handlers/authController')

exports.getMe = (req, res, next) => {
  req.params.id = req.teacher.id
  next()
}

exports.loginTeacher = authController.login(Teacher)
exports.forgetPasswordTeacher = authController.forgotPassword(Teacher)
exports.resetPasswordTeacher = authController.resetPassword(Teacher)

exports.createTeacher = factory.createOne(Teacher)
exports.getAllTeachers = factory.getAll(Teacher, { path: 'coursesToTeach' })
exports.getTeacher = factory.getOne(Teacher, { path: 'coursesToTeach' })
exports.updateTeacher = factory.updateOne(Teacher)
exports.deleteTeacher = factory.deleteOne(Teacher)

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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Teacher.findByIdAndUpdate(req.teacher.id, {
    $set: { active: false },
  })
  res.status(204).json({ status: 'success', data: null })
})

exports.updateTeacherByTeacher = factory.updateOne(Teacher, [
  'role',
  'password',
  'createdAt',
  'active',
  'passwordResetExpires',
  'passwordResetToken',
  'passwordChangedAt',
  'passwordConfirm',
  'email',
])
