const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}
const cookieOptions = {
  // Convert days to milliseconds
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  ),
  // secure: true,
  httpOnly: true,
}
const createSendToken = (user, statusCode, res) => {
  // secret key must be at least 32 CHARS and UNIQUE
  //sending the token = automatically sign in with the created user
  const token = signToken(user._id)
  // we still are not using https
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions)
  // Remove password from the output
  user.password = undefined
  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  })
}

exports.signUp = catchAsync(async (req, res, next) => {
  //                        ⚠⚠⚠⚠⚠
  //we didn't use create(req.body) because if the user inputed the role we dont want it to be added.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  })

  //                        ⚠⚠⚠⚠⚠

  createSendToken(newUser, 201, res)
})

// 🚨🚨🚨🚨🚨🚨🚨🚨 We can implement Rate limiting, max login attempts => to maximize security
// 🚨🚨🚨🚨🚨🚨🚨🚨 Never store token on localStorage
// 🚨🚨🚨🚨🚨🚨🚨🚨 Search for query injection
// UNIMPLEMENTED BY JONAS
// 🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨 NEVER EVER SAVE SENSITIVE DATA TO GIT EX:CONFIG FILE
// 🚨🚨🚨🚨🚨🚨🚨🚨 REQUIRE RE-AUTHENTICATION WHEN HIGH-VALUE ACTION
// 🚨🚨🚨🚨🚨🚨🚨🚨 IMPLEMENT A BLACKLIST OF UNTRUSTED JWT
// 🚨🚨🚨🚨🚨🚨🚨🚨 CONFIRM EMAIL ADDRESS AFTER CREATING ACCOUNT
// 🚨🚨🚨🚨🚨🚨🚨🚨 COMPLEX: KEEP USER LOGGED IN WITH REFRESH TOKENS
// 🚨🚨🚨🚨🚨🚨🚨🚨 2 FACTOR AUTHENTICATION

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  //1) Check if email and password
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400))
  }

  //2) Check if user exists and password is correct

  const user = await User.findOne({ email }).select('+password')

  //!user checks email, second one checks only after user is found(correct email), checks password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  console.log(user)

  //3) SEND TOKEN TO CLIENT IF OK
  createSendToken(user, 200, res)
})

//Authentication

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //get the second element splitted by spaces
    token = req.headers.authorization.split(' ')[1]
  }
  if (!token) return next(new AppError('Your are not logged in', 401))
  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  // console.log(decoded)

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) return next(new AppError('The user no longer exists', 401))
  // 4) Check if user changed password after token was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please login again.', 401),
    )
  }
  //GRANT ACCESS TO PROTECTED ROUTE 🎉🎊
  req.user = currentUser
  next()
})

//specify many number of arguments

//Authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You don't have permission to perform this action", 403),
      )

    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user from email
  const user = await User.findOne({ email: req.body.email })

  if (!user)
    return next(new AppError('There is no user with that email address', 404))
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  //deactivate all validations
  await user.save({ validateBeforeSave: false })
  //3) Send it to the user in an email

  const resetUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/reset-password/${resetToken}`

  const message = `Forgot password? submit a patch request with your new password to ${resetUrl}.If you didn't forget your password, ignore the email`
  // console.log({ message }, '\nemail: ', user.email)
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token valid for 10 mins',
      message,
    })
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })
    console.log(err)
    return next(new AppError('There was an error sending the email', 500))
  }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  //2) If token is not expired && user => set new password
  if (!user) return next(new AppError('Token is invalid or expired', 400))

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()

  //3) Update changedPasswordAt property

  //in middleware

  //4) Log user in
  createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  //🚨🚨🚨
  // Dont use findByIdAndUpdate with anything related to passwords
  // If using findByIdAndUpdate: pre middlewares aren't going to be applied + we dont access 'this' current document

  //1) Get user from collection
  const user = await User.findById(req.user.id).select('+password')
  // if(!user) return next(new AppError('')
  //2) Check if old password is correct
  console.log('req.user: ', req.user, 'req.body: ', req.body)
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(new AppError('Wrong password', 401))

  //3) If so, update password

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm

  await user.save()
  // console.log(user)
  //4) Log user in, send JWT
  createSendToken(user, 200, res)
})
