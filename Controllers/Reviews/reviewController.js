const express = require('express')
const Review = require('../../Models/Courses/reviewModel')
const factory = require('../Handlers/handlerFactory')

exports.createReview = factory.createOneExclude(Review)
exports.getAllReviews = factory.getAll(Review)
exports.getOneReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.ids = factory.getIds(Review)
