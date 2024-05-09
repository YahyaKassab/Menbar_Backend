const express = require('express')
const Review = require('./../Models/Courses/reviewModel')
const factory = require('./handlerFactory')

exports.createReview = factory.createOne(Review)
exports.getAllReviews = factory.getAll(Review)
exports.getOneReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review)
