const Feedback = require('./../Models/Courses/feedbackModel')
const factory = require('./../Controllers/handlerFactory')

exports.createFeedback = factory.createOne(Feedback)
exports.getAllFeedBacks = factory.getAll(Feedback)
