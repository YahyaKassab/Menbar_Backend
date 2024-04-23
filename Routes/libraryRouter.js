const express = require('express')
const authController = require('../Controllers/authController')
const libraryController = require('../Controllers/libraryController')

const router = express.Router()

router
  .route('/')
  .post(libraryController.createLibraryItem)
  .get(libraryController.getAllLibraryItems)
router
  .route('/book')
  .get(libraryController.getAllBooks)
  .post(libraryController.createBook)

router.route('/:id').get(libraryController.getlibraryItem)

router.route('/book/:id').get(libraryController.getBook)

module.exports = router
