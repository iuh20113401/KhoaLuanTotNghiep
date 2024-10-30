const caiDat = require('../model/CaiDatModel');
const ApiError = require('../utils/ApiError');
const APIFeature = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new ApiError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new ApiError('Khống có thông tin với mã số này.', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const data = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { data },
    });
  });
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      if (Array.isArray(populateOptions)) {
        populateOptions.forEach((option) => {
          query = query.populate(option);
        });
      } else {
        // For a single populate option
        query = query.populate(populateOptions);
      }
    }
    const result = await query.select('-__v');

    if (!result) {
      next(new ApiError('Invalid id', 404));
      return;
    }
    res.status(200).json({ status: 'success', data: { result } });
  });
exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res) => {
    let { namHoc, hocKy } = req.query;
    if (!namHoc && !hocKy) {
      const caiDatInfo = await caiDat.find();
      [{ namHoc, hocKy }] = caiDatInfo;
    }
    const feature = new APIFeature(Model.find({ namHoc, hocKy }), req.query)
      .filter()
      .sort()
      .fields()
      .panigation();
    let { query } = feature;
    if (populateOptions) {
      if (Array.isArray(populateOptions)) {
        populateOptions.forEach((option) => {
          query = query.populate(option);
        });
      } else {
        // For a single populate option
        query = query.populate(populateOptions);
      }
    }
    const results = await query.select('-__v');
    res.status(200).json({
      status: 'success',
      results: results.length,
      data: { results },
    });
  });
