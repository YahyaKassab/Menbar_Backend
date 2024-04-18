const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }
    res.status(204).json({ status: 'success', data: null })
  })

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      //return the updated doc not the original one
      new: true,
      // Will run validation on DB
      // If set to false, the DB will accept anything
      runValidators: true,
    })
    if (!doc) {
      return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
      status: 'Success',
      data: doc,
    })
  })

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // //Check if trying to assign a role and
    // const bodyWithoutRole = { ...req.body }
    // if ('role' in bodyWithoutRole) {
    //   delete bodyWithoutRole.role
    // }

    // const newDoc = await Model.create(bodyWithoutRole)

    const newDoc = await Model.create(req.body)

    res.status(201).json({
      status: 'Success',
      data: newDoc,
    })
  })

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
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

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // Allow nested routes
    let filter = {}

    //get all reviews except if I put id => get all reviews for a particular tour
    if (req.params.tourId) filter = { tour: req.params.tourId }

    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    // const allDocs = await features.query.explain()
    const allDocs = await features.query

    //SEND RESPONSE
    res.status(200).json({
      status: 'Success',
      results: allDocs.length,
      data: { data: allDocs },
    })
  })
