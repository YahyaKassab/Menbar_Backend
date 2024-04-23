const express = require('express')
const authController = require('../Controllers/authController')
const libraryController = require('../Controllers/libraryController')

const router = express.Router()

router
  .route('/')
  .get(libraryController.getAllBooks)
  .post(libraryController.createBook)

router.route('/:id').get(libraryController.getBook)

module.exports = router
