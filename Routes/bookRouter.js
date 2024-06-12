const express = require('express')
const bookController = require('../Controllers/Courses/bookController')

const router = express.Router()

router
  .route('/')
  .get(bookController.getAllBooks)
  .post(bookController.createBook)

module.exports = router
