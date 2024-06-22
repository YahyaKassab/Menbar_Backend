const User = require('../models/userModel')
const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Student = require('../../Models/Users/StudentModel')

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

//middleware to set the input id from the logged in user
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Error if trying to update the password

  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('لا يسمح لك بتغيير كلمة السر من هنا', 400))

  //2) Filter out unwanted fields
  const filteredBody = filterObj(req.body, 'name', 'email')
  //3 ) Update user document
  const updatedUser = await Student.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  )

  res.status(200).json({
    status: 'Success',
    data: { user: updatedUser },
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await Student.findByIdAndUpdate(req.user.id, { active: false })
  res.status(204).json({ status: 'success', data: null })
})

exports.getAllUsers = factory.getAll(User)

exports.getUserById = factory.getOne(User)

// Do NOT update Password with this
exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)
