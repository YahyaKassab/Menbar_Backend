const express = require('express')
const factory = require('../Controllers/Handlers/handlerFactory')
const Member = require('../Models/Users/MemberModel')
const memberController = require('../Controllers/Users/memberController')

const router = express.Router()
router.post('/subscribe', memberController.subscribe )
router.post('/contact', memberController.contact )

module.exports = router
