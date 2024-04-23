const express = require('express')
const authController = require('../Controllers/authController')
const commentController = require('../Controllers/commentController')

const router = express.Router()

router.route('/').post(commentController.createComment)
//   .post(libraryController.createBook)

// router.route('/:id').get(libraryController.getBook)

module.exports = router
