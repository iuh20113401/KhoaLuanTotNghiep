const mongoose = require('mongoose');

const deTaiSchema = mongoose.Schema({
  tenDeTai: {
    type: String,
    trim: true,
    requrie: [true, 'Vui lòng nhập tên đề tài '],
  },
  giangVien: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
  },
  moTa: {
    type: String,
    trim: true,
  },
  kyNangCanCo: {
    type: String,
  },
  ketQuaCanDat: {
    type: String,
    trim: true,
  },
  ngayTao: {
    type: Date,
    default: Date.now(),
  },
  soLuongDoAn: {
    type: Number,
    default: 0,
  },
  hinhAnh: {
    type: String,
  },
  tag: [String],
  ghiChu: { type: String, trim: true },
  trangThai: { type: Number, default: 0 },
  danhMuc: {
    type: String,
    trim: true,
    required: [true, 'Đề tài phải thuộc một danh mục cụ thể'],
  },
});

const deTai = mongoose.model('deTais', deTaiSchema);

module.exports = deTai;
