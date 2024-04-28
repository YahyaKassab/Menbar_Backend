const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const ScheduleDay = require('../Models/Student/ScheduleDayModel')

exports.createScheduleDay = factory.createOne(ScheduleDay)
exports.getAllScheduleDays = factory.getAll(ScheduleDay)
