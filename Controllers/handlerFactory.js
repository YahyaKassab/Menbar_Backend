const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

// #region Include Exclude

const excludeArray = (arrayOfObjects, fieldsToExclude) => {
  return arrayOfObjects.map((obj) => {
    const filteredObj = {}
    for (const key in obj) {
      if (!fieldsToExclude.includes(key)) {
        filteredObj[key] = obj[key]
      }
    }
    return filteredObj
  })
}

const excludeObject = (reqBody, fieldsToExclude) => {
  const filteredBody = {}
  for (const key in reqBody) {
    if (!fieldsToExclude.includes(key)) {
      filteredBody[key] = reqBody[key]
    }
  }
  return filteredBody
}

const exclude = (reqBody, fieldsToExclude) => {
  if (Array.isArray(reqBody)) {
    return excludeArray(reqBody, fieldsToExclude)
  } else if (typeof reqBody === 'object' && reqBody !== null) {
    return excludeObject(reqBody, fieldsToExclude)
  } else {
    throw new AppError('Input is neither an array nor an object', 404)
  }
}
const includeArray = (arrayOfObjects, fieldsToInclude) => {
  return arrayOfObjects.map((obj) => {
    const includedObj = {}
    fieldsToInclude.forEach((key) => {
      if (obj[key] !== undefined) {
        includedObj[key] = obj[key]
      }
    })
    return includedObj
  })
}

const includeObject = (reqBody, fieldsToInclude) => {
  const includedBody = {}
  fieldsToInclude.forEach((key) => {
    if (reqBody[key] !== undefined) {
      includedBody[key] = reqBody[key]
    }
  })
  return includedBody
}

const include = (reqBody, fieldsToInclude) => {
  if (Array.isArray(reqBody)) {
    return includeArray(reqBody, fieldsToInclude)
  } else if (typeof reqBody === 'object' && reqBody !== null) {
    return includeObject(reqBody, fieldsToInclude)
  } else {
    throw new AppError('Input is neither an array nor an object', 404)
  }
}

// #endregion

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }
    res.status(204).json({ status: 'success', data: null })
  })

exports.updateOne = (Model, excludedFields) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      exclude(req.body, excludedFields),
      {
        new: true, // Return the updated document
        runValidators: true, // Run validators on update
      },
    )

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    })
  })

exports.updateOneFields = (Model, fields) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      include(req.body, fields),
      {
        // Return the updated doc not the original one
        new: true,
        // Will run validation on DB
        // If set to false, the DB will accept anything
        runValidators: true,
      },
    )

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    })
  })

exports.createOne = (Model, excludedFields) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(exclude(req.body, excludedFields))

    res.status(201).json({
      status: 'Success',
      data: newDoc,
    })
  })

exports.createOneFields = (Model, fields) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(include(req.body, fields))

    res.status(201).json({
      status: 'Success',
      data: newDoc,
    })
  })

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // console.log('req.params.id:', req.params.id)
    let query = Model.findById(req.params.id)
    console.log(query)
    // populate gets guides from Users using its reference id
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    })
  })

exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // Allow nested routes
    let filter = {}
    let query = Model.find(filter)
    //get all reviews except if I put id => get all reviews for a particular tour
    // if (req.params.tourId) filter = { tour: req.params.tourId }
    if (popOptions) query = query.populate(popOptions)
    //EXECUTE QUERY
    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    // const allDocs = await features.query.explain()
    // console.log(req.query)
    // console.log('fe.qe: ', features.query)
    const allDocs = await features.query

    //SEND RESPONSE
    res.status(200).json({
      status: 'Success',
      results: allDocs.length,
      data: { data: allDocs },
    })
  })
