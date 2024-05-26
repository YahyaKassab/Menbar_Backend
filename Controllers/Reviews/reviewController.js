const express = require('express')
const Review = require('../../Models/Courses/reviewModel')
const factory = require('../Handlers/handlerFactory')
const catchAsync = require('../../utils/catchAsync')

exports.createReview = catchAsync(async (req, res, next) => {
  req.body.student = req.student.id
  newDoc = await Review.create(req.body)
  res.status(201).json({
    status: 'Success',
    data: newDoc,
  })
})
exports.getAllReviews = factory.getAll(Review)
exports.getOneReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.ids = factory.getIds(Review)
