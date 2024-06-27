const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const authController = require('../Handlers/authController')
const Member = require('../../Models/Users/MemberModel')
const sendEmail = require('../../utils/email')

exports.subscribe = catchAsync(async (req, res, next) => {
    const member = await Member.create(req.body)
    const htmlMessage = `
    <div style="font-size: 16px;">
    <strong>You got a new subscriber and his email is ${req.body.email}</strong></div>
    `
    await sendEmail({
      email: "ya7yakassab@gmail.com",
      subject: 'New Subscriber',
      html: htmlMessage,
    })

    res.status(201).json({
      status: 'Success',
      data: member,
    })})
exports.contact = catchAsync(async (req, res, next) => {
    const member = await Member.create(req.body)
    const htmlMessage = `
    <div style="font-size: 24px;">
      <strong>You got a new subscriber and his email is ${req.body.email}</strong>
      <br>
      <strong>his name is ${req.body.name}</strong>
      <br>
      <strong>and he wanted to say ${req.body.message}</strong>
    </div>
  `
    await sendEmail({
      email: "ya7yakassab@gmail.com",
      subject: 'New Message from a new subscriber',
      html: htmlMessage,
    })

    res.status(201).json({
      status: 'Success',
      data: member,
    })})