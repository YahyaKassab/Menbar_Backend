const express = require('express')
const authController = require('../Controllers/authController')
const commentController = require('../Controllers/commentController')

const router = express.Router()

router.route('/').post(commentController.createComment)

module.exports = router
