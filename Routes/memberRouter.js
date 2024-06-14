const express = require('express')
const factory = require('../Controllers/Handlers/handlerFactory')
const Member = require('../Models/Users/MemberModel')

const router = express.Router()
router.post('/', factory.createOne(Member))

module.exports = router
