const express = require('express')
const authController = require('../Controllers/authController')
const scheduleController = require('../Controllers/scheduleController')

const router = express.Router()

router
  .route('/')
  .get(scheduleController.getAllScheduleDays)
  .post(scheduleController.createScheduleDay)

// router.route('/:id').get(scheduleController.getScheduleDay)

module.exports = router
