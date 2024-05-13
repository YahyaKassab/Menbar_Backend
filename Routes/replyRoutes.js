const express = require('express')
const authController = require('../Controllers/authController')
// const replyControllers = require('../Controllers/replyControllers')
const router = express.Router({ mergeParams: true })

// router
//   .route('/')
//   .post(replyControllers.setReplyCommentIds, replyControllers.createReplay)
//   .get(replyControllers.getReplay)

module.exports = router
