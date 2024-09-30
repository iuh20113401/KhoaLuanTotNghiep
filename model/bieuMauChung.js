const mongoose = require('mongoose');

const bieuMauChungSchema = new mongoose.Schema({
  ten: { type: String, trim: true },
  dungLuong: { type: String, trim: true },
  ngayTao: { type: Date, default: Date.now() },
  duongDan: { type: String, trim: true },
  loai: Number,
  nguoiTao: { type: mongoose.Schema.ObjectId, ref: 'users', require: true },
  trangThai: { type: Boolean, default: true },
});
const bieuMauChung = mongoose.model('beuMauChung', bieuMauChungSchema);

module.exports = bieuMauChung;
