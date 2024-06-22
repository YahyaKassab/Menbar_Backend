const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const APIFeatures = require('../../utils/apiFeatures')

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

exports.exclude = (reqBody, fieldsToExclude) => {
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

exports.include = (reqBody, fieldsToInclude) => {
  if (Array.isArray(reqBody)) {
    return includeArray(reqBody, fieldsToInclude)
  } else if (typeof reqBody === 'object' && reqBody !== null) {
    return includeObject(reqBody, fieldsToInclude)
  } else {
    throw new AppError('Input is neither an array nor an object', 404)
  }
}

// #endregion

// #region Update
exports.updateOne = (Model, excludedFields) =>
  catchAsync(async (req, res, next) => {
    // console.log("Asdasdasdasd",req.params.id);
    // const id = req.params.id

    let body = req.body

    // Convert the req.body to a plain object if it has a null prototype
    if (body && Object.getPrototypeOf(body) === null) {
      body = Object.assign({}, body)
    }

    if (excludedFields) {
      body = this.exclude(body, excludedFields)
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    })

    if (!doc) {
      return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    })
  })

exports.updateOneFields = (Model, fields) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id
    const doc = await Model.findByIdAndUpdate(
      id,
      this.include(req.body, fields),
      {
        // Return the updated doc not the original one
        new: true,
        // Will run validation on DB
        // If set to false, the DB will accept anything
        runValidators: true,
      },
    )

    if (!doc) {
      return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    })
  })

// #endregion

// #region Create
exports.createOneExclude = (Model, excludedFields) =>
  catchAsync(async (req, res, next) => {
    console.log('req.body:', req.body)
    let newDoc = null
    if (!excludedFields) newDoc = await Model.create(req.body)
    newDoc = await Model.create(this.exclude(req.body, excludedFields))

    res.status(201).json({
      status: 'Success',
      data: newDoc,
    })
  })
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    newDoc = await Model.create(req.body)
    res.status(201).json({
      status: 'Success',
      data: newDoc,
    })
  })

exports.createOneFields = (Model, fields) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(this.include(req.body, fields))

    res.status(201).json({
      status: 'Success',
      data: newDoc,
    })
  })

// #endregion

// #region Get
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // console.log('req.params.id:', req.params.id)
    const id = req.params.id
    let query = Model.findById(id)
    console.log('id:', id)
    // populate gets guides from Users using its reference id
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    })
  })

exports.getOneExclude = (Model, popOptions, excludedFields) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id
    let query = Model.findById(id)

    // populate gets guides from Users using its reference id
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
    }

    // Convert Mongoose document to plain object and filter the document
    const docData = doc.toObject()
    const filteredDoc = excludeObject(docData, excludedFields)

    res.status(200).json({
      status: 'Success',
      data: filteredDoc,
    })
  })

exports.getOneInclude = (Model, popOptions, includedFields) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id
    let query = Model.findById(id)

    // populate gets guides from Users using its reference id
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
    }

    // Convert Mongoose document to plain object and filter the document
    const docData = doc.toObject()
    const filteredDoc = includeObject(docData, includedFields)

    res.status(200).json({
      status: 'Success',
      data: filteredDoc,
    })
  })
exports.getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    console.log('getAll:')
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
exports.getAllExclude = (Model, popOptions, excludedFields) =>
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

    // Filter the documents
    const filteredDocs = excludeArray(
      allDocs.map((doc) => doc.toObject()),
      excludedFields,
    )

    //SEND RESPONSE
    res.status(200).json({
      status: 'Success',
      results: filteredDocs.length,
      data: { data: filteredDocs },
    })
  })

exports.getAllInclude = (Model, popOptions, includedFields) =>
  catchAsync(async (req, res, next) => {
    // Allow nested routes
    let filter = {}
    // Uncomment the following line to filter by tourId if applicable
    // if (req.params.tourId) filter = { tour: req.params.tourId }

    let query = Model.find(filter)
    if (popOptions) query = query.populate(popOptions)

    // EXECUTE QUERY
    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const allDocs = await features.query

    // Filter the documents
    const filteredDocs = includeArray(
      allDocs.map((doc) => doc.toObject()),
      includedFields,
    )

    // SEND RESPONSE
    res.status(200).json({
      status: 'Success',
      results: filteredDocs.length,
      data: { data: filteredDocs },
    })
  })
// #endregion

// #region Delete
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
    }
    res.status(204).json({ status: 'success', data: null })
  })
// #endregion

exports.getIds = (Model) =>
  catchAsync(async (req, res, next) => {
    const docs = await Model.find({}, '_id')
    if (!docs) return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
    const ids = docs.map((doc) => doc._id.toString())
    const modelName = Model.modelName.toLowerCase()

    res.status(200).json({
      status: 'Success',
      results: docs.length,
      data: { [modelName]: ids },
    })
  })
exports.setLectureIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.lecture) req.body.lecture = req.params.lectureId

  next()
}
exports.setCourseIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.course) req.body.course = req.params.courseId
  // if (!req.body.user) req.body.user = req.user.id
  next()
}
