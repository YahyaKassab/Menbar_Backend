const express = require('express')
const authController = require('../Controllers/authController')
const bookController = require('../Controllers/bookController')

const router = express.Router()

router
  .route('/')
  .get(bookController.getAllBooks)
  .post(bookController.createBook)

router.route('/:id').get(bookController.getBook)

module.exports = router
