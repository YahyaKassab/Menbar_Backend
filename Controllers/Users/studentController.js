const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Student = require('../../Models/Users/StudentModel')
const authController = require('../Handlers/authController')

//middleware to set the input id from the logged in user
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.signupStudent = authController.signUp(Student)
exports.loginStudent = authController.login(Student)
exports.forgetPasswordStudent = authController.forgotPassword(Student)
exports.resetPasswordStudent = authController.resetPassword(Student)

exports.createStudent = factory.createOne(Student)
exports.getAllStudents = factory.getAll(Student)
exports.getOneStudent = factory.getOne(Student)
exports.updateStudent = factory.updateOne(Student)

exports.getCourseStats = factory.getOneInclude(
  Student,
  { path: 'courseStats' },
  ['courseStats'],
)

exports.updateStudentByStudent = factory.updateOne(Student, [
  'user.role',
  'user.password',
  'user.createdAt',
  'user.active',
  'user.passwordResetExpires',
  'user.passwordResetToken',
  'user.passwordChangedAt',
  'user.passwordConfirm',
  'user.email',
  'courseStats',
])
exports.deleteStudent = factory.deleteOne(Student)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await Student.findByIdAndUpdate(req.user.id, {
    $set: { 'user.active': false },
  })
  res.status(204).json({ status: 'success', data: null })
})

exports.ids = factory.getIds(Student)
