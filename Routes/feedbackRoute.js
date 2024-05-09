const feedbackController = require('./../Controllers/feedbackController')
const express = require('express')
const router = express.Router()

router
  .route('/')
  .post(feedbackController.createFeedback)
  .get(feedbackController.getAllFeedBacks)

module.exports = router
