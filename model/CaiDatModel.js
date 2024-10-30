const mongoose = require('mongoose');

const caiDatSchema = mongoose.Schema({
  hocKy: {
    type: Number,
    enum: [1, 2],
  },
  namHoc: {
    type: String,
    validate: {
      validator: function (val) {
        return /^\d{4}-\d{4}$/.test(val);
      },
      message: 'Năm học phải có định dạng YYYY-YYYY',
    },
  },
  isDangKyDeTai: {
    type: Boolean,
    default: false,
  },
  isDangKyThucTap: {
    type: Boolean,
    default: false,
  },
  soLuongNhomTrenDeTai: {
    type: Number,
    default: 8,
  },
  soLuongDeTaiToiDa: {
    type: Number,
    default: 16,
  },
});

const caiDat = mongoose.model('caiDats', caiDatSchema);

module.exports = caiDat;
