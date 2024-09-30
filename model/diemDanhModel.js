const mongoose = require('mongoose');

const diemDanhSchema = mongoose.Schema({
  giangVien: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
  },
  ngayTao: {
    type: Date,
    default: Date.now(),
  },
  hieuLuc: { type: Date, default: Date.now() + 60 * 60 * 24 },
  ghiChu: { type: String, trim: true },
  sinhVien: [{ type: mongoose.Schema.ObjectId, ref: 'users' }],
  phong: { type: String, trim: true },
  diaDiem: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
  },
  loai: { type: Number, default: 0 }, // 0 for all, 1 for specific studentz`
});

const diemDanh = mongoose.model('diemDanhs', diemDanhSchema);

module.exports = diemDanh;
