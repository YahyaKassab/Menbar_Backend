const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const sendEmail = require('../../utils/email')
const Course = require('../../Models/Courses/CourseModel')
const LectureStat = require('../../Models/Student/LectureStatModel')
const CourseStat = require('../../Models/Student/CourseStatModel')

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
exports.createSendToken = (model, statusCode, res) => {
  // secret key must be at least 32 CHARS and UNIQUE
  //sending the token = automatically sign in with the created user
  console.log('before sign')
  const token = signToken(model._id)
  console.log('tokenSigned:', token)
  // we still are not using https
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
  res.cookie('jwt', token, cookieOptions)
  // Remove password from the output
  model.password = undefined
  res.status(statusCode).json({
    status: 'success',
    token,
    data: model,
  })
}

exports.signUp = (Model) => async (req, res, next) => {
  try {
    const newUser = await Model.create(req.body)

    // Send token and user data
    this.createSendToken(newUser, 201, res)
  } catch (err) {
    next(err)
  }
}

exports.login = (Model) => async (req, res, next) => {
  try {
    const { email, password } = req.body

    //1) Check if email and password
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400))
    }

    //2) Check if user exists and password is correct

    const _user = await Model.findOne({ email: email }).select('+password')

    //!user checks email, second one checks only after user is found(correct email), checks password
    if (!_user || !(await _user.correctPassword(password, _user.password))) {
      return next(new AppError('Incorrect email or password', 401))
    }

    console.log(_user)

    //3) SEND TOKEN TO CLIENT IF OK
    this.createSendToken(_user, 200, res)
  } catch (err) {
    next(err) // Pass any errors to the error handling middleware
  }
}

//Authentication

exports.protect = (Model) => async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
      throw new Error('Token not provided')
    }

    // Wrap jwt.verify in a promise
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return reject(err)
        }
        resolve(decoded)
      })
    })

    // Now you can safely access properties of decoded
    req.userId = decoded.id

    // 3) Check if user exists
    const currentUser = await Model.findOne({ _id: req.userId })
    if (!currentUser) throw new AppError('The user no longer exists', 401)

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      throw new AppError(
        'User recently changed password. Please login again.',
        401,
      )
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    if (Model.modelName === 'Student') {
      req.student = currentUser
    } else if (Model.modelName === 'Teacher') {
      req.teacher = currentUser
    }
    next()
  } catch (error) {
    next(error)
  }
}

//specify many number of arguments

//Authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Convert roles to lowercase for case-insensitive comparison
    let userRole
    if (req.student) userRole = req.student.role
    else userRole = req.teacher.role
    console.log('role:', userRole)
    if (!roles.includes(userRole)) {
      return next(
        new AppError("You don't have permission to perform this action", 403),
      )
    }

    next()
  }
}

exports.forgotPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    //1) Get user from email
    const user = await Model.findOne({ email: req.body.email })

    if (!user)
      return next(new AppError('There is no user with that email address', 404))
    console.log('user:', user)
    //2) Generate the random reset token
    const resetToken = user.createPasswordResetToken()

    //deactivate all validations
    await user.save({ validateBeforeSave: false })

    //3) Send it to the user in an email
    const resetUrl = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/reset-password/${resetToken}`

    const message = `Forgot password? submit a patch request with your new password to ${resetUrl}. If you didn't forget your password, ignore the email.`

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

      return next(new AppError('There was an error sending the email', 500))
    }
  })

exports.resetPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    //1) Get user based on the token

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex')

    console.log('hashedToken:', hashedToken)
    console.log('token:', req.params.token)
    const user = await Model.findOne({
      'user.passwordResetToken': hashedToken,
      'user.passwordResetExpires': { $gt: Date.now() },
    })
    //2) If token is not expired && user => set new password
    if (!user) return next(new AppError('Token is invalid or expired', 400))

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()
    console.log('user:')

    //3) Update changedPasswordAt property
    //in middleware

    //4) Log user in
    this.createSendToken(user, 200, res)
  })

exports.updatePassword = catchAsync((Model) => async (req, res, next) => {
  //1) Get user from collection
  const user = await Model.findById(req.user.id).select('+password')

  //2) Check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401))
  }

  //3) If so, update password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  //4) Log user in, send JWT
  createSendToken(user, 200, res)
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
