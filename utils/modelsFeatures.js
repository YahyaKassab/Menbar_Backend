// Embed document on Saving
const mongoose = require('mongoose')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.fillEmbedded = (Schema, ModelToFillFrom, fieldToFill) => {
  Schema.pre('save', async function (next) {
    const fieldPromises = this.fieldToFill.map(
      async (id) => await ModelToFillFrom.findById(id),
    )
    this.fieldToFill = await Promise.all(fieldPromises)
    next()
  })
}
